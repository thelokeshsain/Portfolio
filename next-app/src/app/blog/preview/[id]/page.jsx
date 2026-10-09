import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import mongoose from "mongoose";
import Link from "next/link";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import RefreshSession from "@/models/RefreshSession";
import { parseMarkdownToHtml, formatDate } from "@/utils/blogUtils";
import {
  Clock,
  BookOpen,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "[PREVIEW] Editorial Draft — Lokesh Sain Perspectives",
  description: "Private editorial draft preview. Not for public indexing.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export function generatePreviewToken(articleId) {
  const secret = process.env.JWT_SECRET || "fallback_secret";
  return crypto.createHmac("sha256", secret).update(String(articleId)).digest("hex");
}

async function verifyPreviewAuthorization(id, searchParams) {
  // 1. Check signed HMAC token in search params
  const sp = searchParams ? await searchParams : {};
  const token = sp?.token || sp?.previewToken;
  if (token && token === generatePreviewToken(id)) {
    return true;
  }

  // 2. Check admin session cookie or Authorization header
  try {
    const cookieStore = await cookies();
    const sessionCookie =
      cookieStore.get("adminSession")?.value ||
      cookieStore.get("refreshToken")?.value;

    if (sessionCookie) {
      await connectDB();
      const hash = crypto.createHash("sha256").update(sessionCookie).digest("hex");
      const session = await RefreshSession.findOne({
        $or: [{ sessionId: sessionCookie }, { refreshTokenHash: hash }],
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      });
      if (session) return true;
    }

    const headerStore = await headers();
    const authHeader = headerStore.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      return true;
    }
  } catch (err) {
    console.error("Authorization check error in preview:", err.message);
  }

  return false;
}

async function getArticleForPreview(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    await connectDB();
    const article = await Article.findById(id).lean();
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
      },
      readingTime: article.readingTime,
      isAnalysisOrOpinion: article.isAnalysisOrOpinion,
      status: article.status,
      sources: article.sources || [],
      createdAt: article.createdAt ? article.createdAt.toISOString() : null,
      updatedAt: article.updatedAt ? article.updatedAt.toISOString() : null,
    };
  } catch (err) {
    console.error("Preview fetch error:", err.message);
    return null;
  }
}

export default async function PreviewPage({ params, searchParams }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  const isAuthorized = await verifyPreviewAuthorization(id, searchParams);
  const article = await getArticleForPreview(id);

  if (!article) {
    notFound();
  }

  // Drafts and archived articles require explicit admin authorization
  if (article.status !== "published" && !isAuthorized) {
    notFound();
  }

  const htmlContent = parseMarkdownToHtml(article.content);

  return (
    <div>
      {/* Persistent Top Draft Warning Banner */}
      <div
        style={{
          background: "#FEF3C7",
          borderBottom: "1px solid #FCD34D",
          color: "#92400E",
          padding: "10px 24px",
          fontSize: 13,
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 200,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} />
          <span>
            PRIVATE DRAFT PREVIEW &middot; Status: <strong>{article.status.toUpperCase()}</strong> &middot; noindex active
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href="/admin"
            style={{
              color: "#92400E",
              textDecoration: "underline",
              fontSize: 12,
            }}
          >
            Return to Admin Dashboard
          </Link>
        </div>
      </div>

      <article className="p-article-wrapper">
        <header className="p-article-header">
          <div className="p-article-header-meta">
            <span className="p-badge p-badge-category">{article.category}</span>
            <span className="p-badge p-badge-opinion">{article.isAnalysisOrOpinion}</span>
            <span style={{ fontSize: 13, color: "var(--p-text-muted)" }}>
              Draft Created: {formatDate(article.createdAt)}
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

          <div className="p-author-row">
            <div className="p-author-info">
              <div className="p-author-avatar">LS</div>
              <div>
                <span className="p-author-name">{article.author?.name || "Lokesh Sain"}</span>
                <div style={{ fontSize: 11.5, color: "var(--p-text-muted)" }}>
                  {article.author?.role || "Software Engineer & Independent Commentator"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--p-text-muted)" }}>
              Slug: <code style={{ fontFamily: "var(--font-mono)" }}>/blog/{article.slug}</code>
            </div>
          </div>
        </header>

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

        <div
          className="p-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {article.sources && article.sources.length > 0 && (
          <section className="p-sources-section">
            <h3 className="p-sources-title">
              <BookOpen size={18} style={{ color: "var(--p-accent)" }} />
              Sources &amp; Further Reading
            </h3>
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
                    <strong>{src.organization}</strong> &middot; {src.publishDate} &middot; Verified: {src.accessDate}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
