import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import { parseMarkdownToHtml, formatDate } from "@/utils/blogUtils";
import {
  Clock,
  Calendar,
  Share2,
  ChevronRight,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  User,
} from "lucide-react";

export const revalidate = 60; // Incremental Static Regeneration

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lokeshsain.vercel.app";

async function getArticleBySlug(slug) {
  try {
    await connectDB();
    const article = await Article.findOne({ slug, status: "published" }).lean();
    if (!article) return null;

    return {
      id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      dek: article.dek,
      category: article.category,
      tags: article.tags || [],
      content: article.content,
      coverImage: article.coverImage || {},
      author: article.author || {
        name: "Lokesh Sain",
        role: "Software Engineer & Independent Commentator",
        bio: "Software Engineer based in Jaipur. Writing independent analyses on technology, global affairs, industry policy, and modern engineering.",
      },
      readingTime: article.readingTime,
      isAnalysisOrOpinion: article.isAnalysisOrOpinion,
      seoTitle: article.seoTitle || article.title,
      seoDescription: article.seoDescription || article.dek,
      canonicalUrl: article.canonicalUrl || `${BASE_URL}/blog/${article.slug}`,
      sources: article.sources || [],
      publishedAt: article.publishedAt
        ? article.publishedAt.toISOString()
        : article.createdAt.toISOString(),
      updatedAt: article.updatedAt
        ? article.updatedAt.toISOString()
        : article.createdAt.toISOString(),
    };
  } catch (err) {
    console.error("Error fetching article by slug:", err.message);
    return null;
  }
}

async function getRelatedArticles(category, currentSlug) {
  try {
    await connectDB();
    const related = await Article.find({
      status: "published",
      slug: { $ne: currentSlug },
      category: category,
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    return related.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      slug: a.slug,
      dek: a.dek,
      category: a.category,
      readingTime: a.readingTime,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | Lokesh Sain Perspectives",
      description: "The requested perspective could not be found or has not yet been published.",
      robots: "noindex, nofollow",
    };
  }

  const title = article.seoTitle || `${article.title} | Lokesh Sain Perspectives`;
  const description = article.seoDescription || article.dek;
  const canonicalUrl = article.canonicalUrl || `${BASE_URL}/blog/${article.slug}`;

  const imageUrl = article.coverImage?.url
    ? article.coverImage.url.startsWith("http")
      ? article.coverImage.url
      : `${BASE_URL}${article.coverImage.url}`
    : `${BASE_URL}/images/social_preview.webp`;

  return {
    title,
    description,
    authors: [{ name: article.author?.name || "Lokesh Sain", url: BASE_URL }],
    creator: article.author?.name || "Lokesh Sain",
    publisher: "Lokesh Sain — Perspectives",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      url: canonicalUrl,
      title,
      description,
      siteName: "Lokesh Sain — Perspectives",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      section: article.category,
      tags: article.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.coverImage?.alt || article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = await getRelatedArticles(article.category, article.slug);
  const canonicalUrl = article.canonicalUrl || `${BASE_URL}/blog/${article.slug}`;
  const htmlContent = parseMarkdownToHtml(article.content);

  const imageUrl = article.coverImage?.url
    ? article.coverImage.url.startsWith("http")
      ? article.coverImage.url
      : `${BASE_URL}${article.coverImage.url}`
    : `${BASE_URL}/images/social_preview.webp`;

  // Structured Data 1: BlogPosting / Article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    headline: article.title,
    description: article.dek,
    image: [imageUrl],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author?.name || "Lokesh Sain",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Lokesh Sain",
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    articleSection: article.category,
    keywords: (article.tags || []).join(", "),
  };

  // Structured Data 2: BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Perspectives",
        item: `${BASE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.category,
        item: `${BASE_URL}/blog?category=${encodeURIComponent(article.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, breadcrumbSchema]),
        }}
      />

      <article className="p-article-wrapper">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="p-breadcrumbs">
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <Link href="/blog">Perspectives</Link>
          <ChevronRight size={12} />
          <Link href={`/blog?category=${encodeURIComponent(article.category)}`}>
            {article.category}
          </Link>
        </nav>

        {/* Article Header (Above the fold) */}
        <header className="p-article-header">
          <div className="p-article-header-meta">
            <span className="p-badge p-badge-category">{article.category}</span>
            {article.isAnalysisOrOpinion && (
              <span
                className={`p-badge ${
                  article.isAnalysisOrOpinion === "Opinion"
                    ? "p-badge-opinion"
                    : "p-badge-analysis"
                }`}
              >
                {article.isAnalysisOrOpinion}
              </span>
            )}
            <span style={{ fontSize: 13, color: "var(--p-text-muted)" }}>
              {formatDate(article.publishedAt)}
            </span>
            <span style={{ color: "var(--p-border)" }}>&middot;</span>
            <span
              style={{
                fontSize: 13,
                color: "var(--p-text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Clock size={13} /> {article.readingTime}
            </span>
          </div>

          <h1 className="p-article-h1">{article.title}</h1>

          <p className="p-article-dek">{article.dek}</p>

          {/* Author Byline & Social Metadata */}
          <div className="p-author-row">
            <div className="p-author-info">
              <div className="p-author-avatar">LS</div>
              <div>
                <Link href="/#about" className="p-author-name">
                  {article.author?.name || "Lokesh Sain"}
                </Link>
                <div style={{ fontSize: 11.5, color: "var(--p-text-muted)" }}>
                  {article.author?.role || "Software Engineer & Independent Commentator"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {article.updatedAt && article.updatedAt !== article.publishedAt && (
                <div style={{ fontSize: 11.5, color: "var(--p-text-muted)" }}>
                  Updated: {formatDate(article.updatedAt, { month: "short" })}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage?.url && (
          <div className="p-cover-container">
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid var(--p-border)",
                background: "var(--p-muted-surface)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${article.coverImage.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-label={article.coverImage.alt || article.title}
              />
            </div>
            {(article.coverImage.caption || article.coverImage.credit) && (
              <p className="p-cover-caption">
                {article.coverImage.caption}{" "}
                {article.coverImage.credit && (
                  <span style={{ color: "var(--p-text-muted)" }}>
                    (Credit: {article.coverImage.credit})
                  </span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Longform Editorial Body */}
        <div
          className="p-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Sources & Further Reading Section */}
        {article.sources && article.sources.length > 0 && (
          <section className="p-sources-section" aria-label="Sources and further reading">
            <h3 className="p-sources-title">
              <BookOpen size={18} style={{ color: "var(--p-accent)" }} />
              Sources &amp; Further Reading
            </h3>
            <p style={{ fontSize: 13, color: "var(--p-text-muted)", marginBottom: 16 }}>
              Perspectives adheres to evidence-based editorial practices. The primary sources and authoritative documents cited in this analysis include:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {article.sources.map((src, i) => (
                <div key={i} className="p-source-item">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-source-title"
                  >
                    {src.title} &rarr;
                  </a>
                  <div className="p-source-meta">
                    <strong>{src.organization}</strong> &middot; {src.publishDate || "Official Source"} &middot; Verified: {src.accessDate || "October 9, 2026"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Editorial Standards & Fact Distinction Notice */}
        <div
          style={{
            margin: "32px 0",
            padding: "16px 20px",
            background: "var(--p-muted-surface)",
            border: "1px solid var(--p-border)",
            borderRadius: 8,
            fontSize: 12.5,
            color: "var(--p-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "var(--p-text-primary)" }}>Editorial Standards:</strong> This analysis synthesizes confirmed government administrative announcements, reputable international reporting, and statutory immigration frameworks. Statements regarding government allegations reflect active administrative claims, not adjudicated findings. Personal commentary is clearly identified as opinion.
        </div>

        {/* Author Bio Vignette */}
        <div className="p-author-bio-box">
          <div className="p-author-avatar" style={{ width: 50, height: 50, flexShrink: 0 }}>
            LS
          </div>
          <div className="p-author-bio-text">
            <h4>About {article.author?.name || "Lokesh Sain"}</h4>
            <p>
              {article.author?.bio ||
                "Software Engineer based in Jaipur, India. Writing independent perspectives on global technology policy, software engineering systems, and industry developments."}
            </p>
            <div style={{ marginTop: 8 }}>
              <Link
                href="/#about"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--p-accent)",
                }}
              >
                View technical portfolio and contact details &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section style={{ marginTop: 56 }} aria-label="Related Perspectives">
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--p-text-primary)",
                marginBottom: 20,
              }}
            >
              Related Perspectives
            </h3>
            <div style={{ display: "grid", gap: 16 }}>
              {related.map((rel) => (
                <div
                  key={rel.id}
                  style={{
                    background: "var(--p-surface)",
                    border: "1px solid var(--p-border)",
                    borderRadius: 8,
                    padding: "16px 20px",
                  }}
                >
                  <div style={{ fontSize: 11.5, color: "var(--p-accent)", fontWeight: 600, marginBottom: 4 }}>
                    {rel.category} &middot; {formatDate(rel.publishedAt, { month: "short" })}
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--p-text-primary)", marginBottom: 4 }}>
                    <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                  </h4>
                  <p style={{ fontSize: 13, color: "var(--p-text-secondary)", margin: 0 }}>
                    {rel.dek}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Return to Blog */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--p-accent)",
            }}
          >
            <ArrowLeft size={14} /> Back to All Perspectives
          </Link>
        </div>
      </article>
    </>
  );
}
