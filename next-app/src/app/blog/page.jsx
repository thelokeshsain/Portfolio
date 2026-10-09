import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import { formatDate } from "@/utils/blogUtils";
import { Clock, ArrowRight, User, BookOpen, AlertCircle } from "lucide-react";

export const revalidate = 60; // Incremental Static Regeneration

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lokeshsain.vercel.app";

async function getPublishedArticles({ category, query }) {
  try {
    await connectDB();
    const filter = { status: "published" };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (query && query.trim()) {
      const sanitizedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: sanitizedQuery, $options: "i" } },
        { dek: { $regex: sanitizedQuery, $options: "i" } },
        { content: { $regex: sanitizedQuery, $options: "i" } },
      ];
    }

    const articles = await Article.find(filter)
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .lean();

    return articles.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      slug: a.slug,
      dek: a.dek,
      category: a.category,
      tags: a.tags || [],
      coverImage: a.coverImage || {},
      author: a.author || { name: "Lokesh Sain" },
      readingTime: a.readingTime,
      isAnalysisOrOpinion: a.isAnalysisOrOpinion,
      featured: Boolean(a.featured),
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching published articles:", err.message);
    return [];
  }
}

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category;
  const query = sp?.q;

  let title = "Perspectives — Lokesh Sain | Independent Technical & Global Commentary";
  let description =
    "Independent perspectives, technology policy essays, software engineering analysis, and business commentary by Lokesh Sain.";

  if (category && category !== "all") {
    title = `${category} Perspectives | Lokesh Sain`;
    description = `Explore independent perspectives, analysis, and commentary on ${category} by Lokesh Sain.`;
  } else if (query) {
    title = `Search: "${query}" | Lokesh Sain Perspectives`;
    description = `Search results for "${query}" across Lokesh Sain Perspectives editorial publication.`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/blog${category && category !== "all" ? `?category=${encodeURIComponent(category)}` : ""}`,
    },
  };
}

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category || "all";
  const query = sp?.q || "";

  const articles = await getPublishedArticles({ category, query });

  // Separate lead/featured article from the grid if on default view
  const isFiltered = (category && category !== "all") || Boolean(query);
  const leadArticle = !isFiltered && articles.length > 0 ? articles[0] : null;
  const gridArticles = !isFiltered && articles.length > 0 ? articles.slice(1) : articles;

  // JSON-LD structured data for the collection/blog
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BASE_URL}/blog#blog`,
    name: "Lokesh Sain — Perspectives",
    description: "Independent perspectives on technology, world affairs, business and sport.",
    url: `${BASE_URL}/blog`,
    publisher: {
      "@type": "Person",
      name: "Lokesh Sain",
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <div className="p-container">
        {/* Active Filter Notice */}
        {isFiltered && (
          <div
            style={{
              marginBottom: 28,
              padding: "12px 18px",
              background: "var(--p-surface)",
              border: "1px solid var(--p-border)",
              borderRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 14, color: "var(--p-text-secondary)" }}>
              Filtering by:{" "}
              {category !== "all" && (
                <strong style={{ color: "var(--p-accent)" }}>Category: {category} </strong>
              )}
              {query && (
                <strong style={{ color: "var(--p-text-primary)" }}>Query: &quot;{query}&quot;</strong>
              )}
              {" "}({articles.length} {articles.length === 1 ? "article" : "articles"} found)
            </div>
            <Link
              href="/blog"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--p-accent)",
              }}
            >
              Clear filters
            </Link>
          </div>
        )}

        {/* Empty State when no published articles match */}
        {articles.length === 0 ? (
          <div
            style={{
              background: "var(--p-surface)",
              border: "1px solid var(--p-border)",
              borderRadius: 12,
              padding: "64px 24px",
              textAlign: "center",
              maxWidth: 680,
              margin: "32px auto 64px",
            }}
          >
            <BookOpen
              size={40}
              style={{ color: "var(--p-accent)", margin: "0 auto 16px", strokeWidth: 1.5 }}
            />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--p-text-primary)",
                marginBottom: 10,
              }}
            >
              {isFiltered ? "No articles match your search" : "Perspectives in Editorial Review"}
            </h2>
            <p
              style={{
                fontSize: 14.5,
                color: "var(--p-text-secondary)",
                lineHeight: 1.6,
                maxWidth: 480,
                margin: "0 auto 24px",
              }}
            >
              {isFiltered
                ? "Try selecting another category or clearing your search term to view all commentary."
                : "The daily editorial queue is currently active. Inaugural research and commentary drafts are undergoing final review prior to publication."}
            </p>
            {isFiltered ? (
              <Link
                href="/blog"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  background: "var(--p-accent)",
                  color: "#FFFFFF",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                View All Articles
              </Link>
            ) : (
              <div style={{ fontSize: 13, color: "var(--p-text-muted)" }}>
                Author: <strong>Lokesh Sain</strong> &middot; Jaipur, India
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Prominent Lead / Featured Story (Only if not filtering) */}
            {leadArticle && (
              <section aria-label="Featured Story">
                <div className="p-section-title">Lead Perspective</div>
                <article className="p-lead-card">
                  <div className="p-lead-grid">
                    <div className="p-lead-content">
                      <div className="p-lead-meta">
                        <span className="p-badge p-badge-category">
                          {leadArticle.category}
                        </span>
                        {leadArticle.isAnalysisOrOpinion && (
                          <span
                            className={`p-badge ${
                              leadArticle.isAnalysisOrOpinion === "Opinion"
                                ? "p-badge-opinion"
                                : "p-badge-analysis"
                            }`}
                          >
                            {leadArticle.isAnalysisOrOpinion}
                          </span>
                        )}
                        <span style={{ color: "var(--p-text-muted)" }}>
                          {formatDate(leadArticle.publishedAt)}
                        </span>
                        <span style={{ color: "var(--p-text-muted)" }}>&middot;</span>
                        <span
                          style={{
                            color: "var(--p-text-muted)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Clock size={12} /> {leadArticle.readingTime}
                        </span>
                      </div>

                      <h2 className="p-lead-title">
                        <Link href={`/blog/${leadArticle.slug}`}>
                          {leadArticle.title}
                        </Link>
                      </h2>

                      <p className="p-lead-dek">{leadArticle.dek}</p>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--p-text-secondary)" }}>
                          <span style={{ fontWeight: 600, color: "var(--p-text-primary)" }}>
                            By {leadArticle.author?.name || "Lokesh Sain"}
                          </span>
                        </div>

                        <Link
                          href={`/blog/${leadArticle.slug}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontWeight: 600,
                            color: "var(--p-accent)",
                            fontSize: 13.5,
                          }}
                        >
                          Read Perspective <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    <div className="p-lead-image-box">
                      {leadArticle.coverImage?.url ? (
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            minHeight: 280,
                            backgroundImage: `url(${leadArticle.coverImage.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                          aria-label={leadArticle.coverImage.alt || leadArticle.title}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            padding: 24,
                            background: "linear-gradient(135deg, #F0EEE8, #E7E4DE)",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: 28,
                              fontWeight: 800,
                              color: "var(--p-text-muted)",
                              opacity: 0.5,
                            }}
                          >
                            PERSPECTIVES
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* Latest Articles Grid */}
            {gridArticles.length > 0 && (
              <section aria-label="Latest Articles">
                <div className="p-section-title">
                  {isFiltered ? "Matching Perspectives" : "Latest Perspectives"}
                </div>
                <div className="p-grid">
                  {gridArticles.map((art) => (
                    <article key={art.id} className="p-card">
                      {art.coverImage?.url && (
                        <div className="p-card-media">
                          <Link href={`/blog/${art.slug}`}>
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                backgroundImage: `url(${art.coverImage.url})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                              aria-label={art.coverImage.alt || art.title}
                            />
                          </Link>
                        </div>
                      )}

                      <div className="p-card-body">
                        <div className="p-card-meta">
                          <span className="p-badge p-badge-category">
                            {art.category}
                          </span>
                          <span>{formatDate(art.publishedAt, { month: "short" })}</span>
                          <span>&middot;</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Clock size={11} /> {art.readingTime}
                          </span>
                        </div>

                        <h3 className="p-card-title">
                          <Link href={`/blog/${art.slug}`}>{art.title}</Link>
                        </h3>

                        <p className="p-card-excerpt">{art.dek}</p>

                        <div className="p-card-footer">
                          <span>By {art.author?.name || "Lokesh Sain"}</span>
                          <Link
                            href={`/blog/${art.slug}`}
                            style={{
                              color: "var(--p-accent)",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            Read <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* About the Author Vignette */}
        <section
          style={{
            marginTop: 48,
            padding: "32px 28px",
            background: "var(--p-surface)",
            border: "1px solid var(--p-border)",
            borderRadius: 12,
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 20,
            alignItems: "center",
          }}
          aria-label="About the Author"
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#1E293B",
              color: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
              border: "2px solid var(--p-border)",
            }}
          >
            LS
          </div>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--p-text-primary)",
                marginBottom: 4,
              }}
            >
              About Lokesh Sain — Perspectives
            </h3>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--p-text-secondary)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Independent commentary by software engineer Lokesh Sain. Covering the intersection of engineering architecture, technology policy, geopolitical dynamics, and employment markets.
            </p>
            <div style={{ marginTop: 10 }}>
              <Link
                href="/#about"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--p-accent)",
                }}
              >
                View engineering background &amp; technical projects &rarr;
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
