"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, BookOpen, ArrowLeft, AlertTriangle } from "lucide-react";

export default function BlogError({ error, reset }) {
  useEffect(() => {
    console.error("Perspectives segment error:", {
      digest: error?.digest || "unknown",
      message: error?.message || "Blog segment error",
    });
  }, [error]);

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
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#FEF3C7",
            color: "#D97706",
            marginBottom: "16px",
          }}
        >
          <AlertTriangle size={24} />
        </div>

        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 800,
            color: "var(--p-text-primary, #191919)",
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
            lineHeight: 1.25,
            fontFamily: "var(--font-display, inherit)",
          }}
        >
          Unable to Load Perspectives
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "var(--p-text-secondary, #5A5A5A)",
            lineHeight: 1.6,
            maxWidth: "500px",
            margin: "0 auto 24px",
          }}
        >
          An unexpected issue prevented this editorial section from rendering properly. Please try reloading this view.
        </p>

        {error?.digest && (
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "6px",
              backgroundColor: "var(--p-muted-surface, #F0EEE8)",
              fontSize: "12px",
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--p-text-muted, #757575)",
              marginBottom: "28px",
            }}
          >
            Digest: <code>{error.digest}</code>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "var(--p-accent, #2457D6)",
              color: "#FFFFFF",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={15} />
            <span>Try Again</span>
          </button>

          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "var(--p-muted-surface, #F0EEE8)",
              border: "1px solid var(--p-border, #E7E4DE)",
              color: "var(--p-text-primary, #191919)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <BookOpen size={15} />
            <span>Perspectives Index</span>
          </Link>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: "var(--p-text-secondary, #5A5A5A)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} />
            <span>Portfolio Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
