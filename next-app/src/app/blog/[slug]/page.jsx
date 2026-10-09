import { notFound } from "next/navigation";
import { cache } from "react";
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
  ShieldCheck,
  Mail,
  AlertTriangle,
} from "lucide-react";

export const revalidate = 60; // Incremental Static Regeneration (1 minute)
export const dynamicParams = true; // Allow new articles published after build to be generated on demand

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lokeshsain.vercel.app";

/**
 * Pre-render all published articles at build time for instant Edge CDN delivery
 */
export async function generateStaticParams() {
  try {
    await connectDB();
    const articles = await Article.find({ status: "published" }).select("slug").lean();
    return articles.map((a) => ({ slug: a.slug }));
  } catch (err) {
    console.error("Error in generateStaticParams:", err.message);
    return [];
  }
}

/**
 * Deduplicated article query using React cache to prevent redundant DB calls
 * across generateMetadata and the main page component within the same request.
 */
const getArticleBySlug = cache(async (slug) => {
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
});

async function getRelatedArticles(category, currentSlug) {
  try {
    await connectDB();
    const related = await Article.find({
      status: "published",
      slug: { $ne: currentSlug },
      category: category,
    })
      .select("title slug dek category readingTime publishedAt createdAt")
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
    isPartOf: {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      name: "Lokesh Sain Portfolio & Perspectives",
      url: BASE_URL,
    },
    headline: article.title,
    description: article.dek,
    inLanguage: "en-US",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    url: canonicalUrl,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    articleSection: article.category,
    keywords: (article.tags || []).join(", "),
    wordCount: article.content ? article.content.split(/\s+/).length : undefined,
    author: {
      "@type": "Person",
      name: article.author?.name || "Lokesh Sain",
      jobTitle: article.author?.role || "Software Engineer",
      url: `${BASE_URL}/#about`,
    },
    publisher: {
      "@type": "Person",
      name: "Lokesh Sain",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/favicon.svg`,
      },
    },
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="p-article-container" itemScope itemType="https://schema.org/BlogPosting">
        {/* Breadcrumb Navigation */}
        <nav className="p-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <Link href="/blog">Perspectives</Link>
          <ChevronRight size={12} />
          <Link href={`/blog?category=${encodeURIComponent(article.category)}`}>
            {article.category}
          </Link>
          <ChevronRight size={12} />
          <span className="p-breadcrumb-current" aria-current="page">
            {article.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="p-header">
          {/* Category & Type Badges */}
          <div className="p-meta-badges">
            <Link
              href={`/blog?category=${encodeURIComponent(article.category)}`}
              className="p-badge p-badge-category"
            >
              {article.category}
            </Link>

            {article.isAnalysisOrOpinion === "Analysis" && (
              <span className="p-badge p-badge-analysis">
                <CheckCircle2 size={11} /> Deep Analysis
              </span>
            )}
            {article.isAnalysisOrOpinion === "Opinion" && (
              <span className="p-badge p-badge-opinion">Opinion &amp; Commentary</span>
            )}

            <span className="p-reading-time">
              <Clock size={12} /> {article.readingTime}
            </span>
          </div>

          {/* Headline (H1) */}
          <h1 className="p-headline" itemProp="headline">
            {article.title}
          </h1>

          {/* Dek / Sub-headline */}
          <p className="p-dek" itemProp="description">
            {article.dek}
          </p>

          {/* Author Byline & Date */}
          <div className="p-byline-bar">
            <div className="p-byline-left">
              <div className="p-author-avatar">
                {article.author?.avatar ? (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <User size={18} style={{ color: "var(--p-text-muted)" }} />
                )}
              </div>
              <div className="p-author-details">
                <span className="p-author-name" itemProp="author">
                  {article.author?.name || "Lokesh Sain"}
                </span>
                <span className="p-author-role">
                  {article.author?.role || "Software Engineer & Independent Commentator"}
                </span>
              </div>
            </div>

            <div className="p-byline-right">
              <div className="p-date-item">
                <Calendar size={13} />
                <time dateTime={article.publishedAt} itemProp="datePublished">
                  {formatDate(article.publishedAt, { month: "long" })}
                </time>
              </div>
              {article.updatedAt && article.updatedAt !== article.publishedAt && (
                <div className="p-date-updated" itemProp="dateModified">
                  Updated: {formatDate(article.updatedAt, { month: "short" })}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Cover Image — Rendered using Next.js Image with priority and explicit aspect ratio */}
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
              <Image
                src={article.coverImage.url}
                alt={article.coverImage.alt || article.title}
                fill
                priority
                sizes="(max-width: 800px) 100vw, 800px"
                style={{ objectFit: "cover" }}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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

        {/* Editorial Standards, Corrections & Legal Disclaimers */}
        <div
          style={{
            margin: "32px 0",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Editorial Standards & Fact Distinction Notice */}
          <div
            style={{
              padding: "16px 20px",
              background: "var(--p-muted-surface)",
              border: "1px solid var(--p-border)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "var(--p-text-secondary)",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <ShieldCheck size={18} style={{ color: "var(--p-accent)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: "var(--p-text-primary)" }}>Editorial Standards:</strong> This analysis synthesizes confirmed government administrative announcements, reputable international reporting, and statutory immigration frameworks. Statements regarding government allegations reflect active administrative claims, not adjudicated findings. Personal commentary is clearly identified as opinion.
            </div>
          </div>

          {/* Legal / Immigration Disclaimer */}
          <div
            style={{
              padding: "14px 18px",
              background: "rgba(245, 158, 11, 0.06)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              borderRadius: 8,
              fontSize: 12,
              color: "#92400E",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <AlertTriangle size={16} style={{ color: "#D97706", flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Legal Disclaimer:</strong> This publication is produced strictly for journalistic, educational, and analytical purposes. It does not constitute formal legal, corporate, or immigration counsel. Immigration statutes and administrative procedures are subject to rapid evolution and judicial review. Readers should consult licensed legal counsel regarding their specific petitions.
            </div>
          </div>

          {/* Factual Correction Process */}
          <div
            style={{
              padding: "12px 18px",
              background: "var(--p-surface)",
              border: "1px solid var(--p-border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--p-text-muted)",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Mail size={14} style={{ color: "var(--p-accent)" }} />
              <span>Have a factual correction, update, or primary source document?</span>
            </div>
            <a
              href="mailto:iamlokeshsain@gmail.com?subject=Editorial%20Correction%20—%20Perspectives"
              style={{
                color: "var(--p-accent)",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Submit Editorial Correction &rarr;
            </a>
          </div>
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
