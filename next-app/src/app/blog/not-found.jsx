import Link from "next/link";
import { BookOpen, ArrowLeft, Home, Compass } from "lucide-react";

export const metadata = {
  title: "Article Not Found | Lokesh Sain Perspectives",
  description: "The requested perspective could not be found or has not yet been published.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BlogNotFound() {
  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "60px auto 100px",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "var(--p-surface, #FFFFFF)",
          border: "1px solid var(--p-border, #E7E4DE)",
          borderRadius: "12px",
          padding: "clamp(36px, 6vw, 56px) clamp(20px, 4vw, 40px)",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--p-accent, #2457D6)",
            backgroundColor: "var(--p-accent-subtle, #EAF0FF)",
            padding: "4px 12px",
            borderRadius: "9999px",
            marginBottom: "16px",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          404 • Not Found
        </span>

        <h1
          style={{
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 800,
            color: "var(--p-text-primary, #191919)",
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
            lineHeight: 1.25,
            fontFamily: "var(--font-display, inherit)",
          }}
        >
          Perspective Not Found
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "var(--p-text-secondary, #5A5A5A)",
            lineHeight: 1.65,
            maxWidth: "520px",
            margin: "0 auto 32px",
          }}
        >
          The analysis or article you requested is not available. It may have been updated with a revised slug, archived, or not yet published.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "8px",
              backgroundColor: "var(--p-accent, #2457D6)",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.2s ease",
            }}
          >
            <BookOpen size={16} />
            <span>Browse All Perspectives</span>
          </Link>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "8px",
              backgroundColor: "var(--p-muted-surface, #F0EEE8)",
              border: "1px solid var(--p-border, #E7E4DE)",
              color: "var(--p-text-primary, #191919)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
