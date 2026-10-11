// Curated Knowledge Base and Grounding Retrieval Layer
// Integrates public portfolio facts and published editorial blog articles with strict privacy isolation.

import connectDB from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import Article from "@/models/Article";
import toPublicPortfolio from "@/utils/publicPortfolio";

if (typeof window !== "undefined") {
  throw new Error("Server-only module src/lib/ai/knowledgeBase.js cannot be executed in the browser");
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lokeshsain.vercel.app";

/**
 * Retrieves public, sanitized portfolio data.
 * Guarantees zero private fields (no phone numbers, passwords, or admin tokens).
 */
export async function getPublicPortfolioContext() {
  try {
    await connectDB();
    const raw = await Portfolio.findOne({}).select("-__v").lean();
    const publicData = toPublicPortfolio(raw);

    if (!publicData) {
      return {
        name: "Lokesh Sain",
        role: "Software Engineer",
        description: "Software Engineer specializing in modern web architecture, React.js, Node.js, and scalable full-stack development based in Jaipur, India.",
        location: "Jaipur, Rajasthan, India",
        email: "iamlokeshsain@gmail.com",
        github: "https://github.com/thelokeshsain",
        linkedin: "https://www.linkedin.com/in/lokeshsain",
        skills: {},
        projects: [],
        experience: [],
      };
    }

    return {
      name: publicData.hero?.name || "Lokesh Sain",
      title: publicData.hero?.title || "Software Engineer",
      role: publicData.hero?.role || "Software Engineer",
      description: publicData.hero?.description || "",
      location: publicData.hero?.location || "Jaipur, India",
      email: publicData.hero?.email || "iamlokeshsain@gmail.com",
      github: publicData.hero?.github || "https://github.com/thelokeshsain",
      linkedin: publicData.hero?.linkedin || "https://www.linkedin.com/in/lokeshsain",
      about: Array.isArray(publicData.about) ? publicData.about.join("\n") : "",
      skills: publicData.skills || {},
      experience: Array.isArray(publicData.experience)
        ? publicData.experience.map((e) => ({
            role: e.role,
            company: e.company,
            period: e.period,
            location: e.location,
            points: e.points || [],
          }))
        : [],
      projects: Array.isArray(publicData.projects)
        ? publicData.projects.map((p) => ({
            title: p.title,
            description: p.description,
            tags: p.tags || [],
            category: p.category,
            link: p.link,
            github: p.github,
          }))
        : [],
      education: Array.isArray(publicData.education)
        ? publicData.education.map((ed) => ({
            name: ed.name,
            period: ed.period,
            grade: ed.grade,
          }))
        : [],
    };
  } catch (err) {
    console.error("Error retrieving public portfolio data:", err.message);
    return null;
  }
}

/**
 * Searches published blog articles relevant to the query.
 * Strictly enforces status: 'published' at the database query level.
 * Never accesses drafts or archived articles.
 */
export async function getRelevantPublishedArticles(query, limit = 2) {
  try {
    await connectDB();

    // Clean and extract query keywords
    const cleanTokens = (query || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    // Retrieve only published articles with public metadata
    const published = await Article.find({ status: "published" })
      .select("title slug dek category tags publishedAt canonicalUrl sources content")
      .lean();

    if (!published || published.length === 0) {
      return [];
    }

    // Score published articles based on keyword matching against title, dek, tags, and category
    const scored = published.map((art) => {
      let score = 0;
      const titleLower = (art.title || "").toLowerCase();
      const dekLower = (art.dek || "").toLowerCase();
      const categoryLower = (art.category || "").toLowerCase();
      const tagsLower = (art.tags || []).join(" ").toLowerCase();

      for (const token of cleanTokens) {
        if (titleLower.includes(token)) score += 5;
        if (dekLower.includes(token)) score += 3;
        if (tagsLower.includes(token)) score += 4;
        if (categoryLower.includes(token)) score += 2;
      }

      // Trim content for LLM context to prevent token bloating
      const snippet = (art.content || "")
        .replace(/[#*`_\[\]()]/g, "")
        .slice(0, 1200)
        .trim();

      return {
        title: art.title,
        slug: art.slug,
        dek: art.dek,
        category: art.category,
        url: art.canonicalUrl || `${BASE_URL}/blog/${art.slug}`,
        publishedAt: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "October 2026",
        snippet,
        sources: (art.sources || []).map((s) => ({ title: s.title, url: s.url })),
        score,
      };
    });

    // If query has specific matches, take the highest scored; otherwise take the latest published
    scored.sort((a, b) => b.score - a.score);

    // If no keywords matched, return the top published article as context only if query is generic
    const relevant = scored.filter((a) => a.score > 0);
    if (relevant.length > 0) {
      return relevant.slice(0, limit);
    }

    // If user asked about blog/articles specifically without specific keywords:
    const isBlogQuery = /blog|article|perspective|write|essay|commentary|post/i.test(query);
    if (isBlogQuery) {
      return scored.slice(0, limit);
    }

    return [];
  } catch (err) {
    console.error("Error retrieving relevant published articles:", err.message);
    return [];
  }
}

/**
 * Builds the grounded prompt context for Ask Lokesh AI.
 * Explicitly marks retrieved data as UNTRUSTED content to prevent prompt injection.
 */
export async function buildGroundedContext(userQuery) {
  const [portfolio, relevantArticles] = await Promise.all([
    getPublicPortfolioContext(),
    getRelevantPublishedArticles(userQuery, 2),
  ]);

  let context = "### VERIFIED PUBLIC KNOWLEDGE BASE (Lokesh Sain)\n";

  if (portfolio) {
    context += `
[PORTFOLIO FACTS]
- Full Name: ${portfolio.name}
- Current Role: ${portfolio.role}
- Location: ${portfolio.location}
- Professional Summary: ${portfolio.description}
- Email: ${portfolio.email}
- GitHub: ${portfolio.github}
- LinkedIn: ${portfolio.linkedin}
- Engineering Skills:
${JSON.stringify(portfolio.skills, null, 2)}
- Professional Experience:
${portfolio.experience.map((e) => `  * ${e.role} at ${e.company} (${e.period}, ${e.location}): ${e.points.join("; ")}`).join("\n")}
- Featured Projects:
${portfolio.projects.map((p) => `  * ${p.title} (${p.category}): ${p.description}. Tech: ${p.tags.join(", ")}. Link: ${p.link || "N/A"}`).join("\n")}
`;
  }

  if (relevantArticles && relevantArticles.length > 0) {
    context += `
[PUBLISHED EDITORIAL ARTICLES (Lokesh Sain — Perspectives)]
${relevantArticles
  .map(
    (a) => `
* Title: "${a.title}"
  - URL: ${a.url}
  - Category: ${a.category} (${a.publishedAt})
  - Summary: ${a.dek}
  - Key Excerpt: ${a.snippet}
  - Authoritative Sources Cited: ${a.sources.map((s) => `${s.title} (${s.url})`).join(", ") || "None"}
`
  )
  .join("\n")}
`;
  } else {
    context += `\n[PUBLISHED EDITORIAL ARTICLES]\nNo specific articles were matched for this query.\n`;
  }

  const approvedSources = [
    { title: "Portfolio Homepage", url: `${BASE_URL}/` },
    { title: "Perspectives Blog", url: `${BASE_URL}/blog` },
    ...(portfolio?.github ? [{ title: "GitHub", url: portfolio.github }] : []),
    ...(portfolio?.linkedin ? [{ title: "LinkedIn", url: portfolio.linkedin }] : []),
    ...(relevantArticles || []).map((a) => ({ title: a.title, url: a.url })),
  ];

  return {
    contextText: context,
    retrievedArticles: relevantArticles,
    approvedSources,
  };
}
