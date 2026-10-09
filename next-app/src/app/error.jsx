"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, BookOpen, AlertCircle } from "lucide-react";

export default function RootError({ error, reset }) {
  useEffect(() => {
    // Log unexpected errors safely on client console without leaking sensitive credentials
    console.error("Runtime exception caught by root error boundary:", {
      digest: error?.digest || "unknown",
      message: error?.message || "Internal error",
    });
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#05070A",
        color: "#F0F2F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-body, system-ui, -apple-system, sans-serif)",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          width: "100%",
          textAlign: "center",
          backgroundColor: "#0B0F17",
          border: "1px solid #1E2638",
          borderRadius: "20px",
          padding: "clamp(32px, 6vw, 48px) clamp(20px, 5vw, 36px)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            backgroundColor: "rgba(248, 113, 113, 0.12)",
            color: "#F87171",
            border: "1px solid rgba(248, 113, 113, 0.25)",
            marginBottom: "20px",
          }}
        >
          <AlertCircle size={28} />
        </div>

        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 800,
            color: "#F0F2F5",
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: "#94A3B8",
            fontSize: "15px",
            lineHeight: 1.6,
            maxWidth: "460px",
            margin: "0 auto 24px",
          }}
        >
          An unexpected error occurred while rendering this section. Our technical team has been alerted. You can retry loading or return to safety.
        </p>

        {error?.digest && (
          <div
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "12px",
              color: "#64748B",
              marginBottom: "28px",
            }}
          >
            Reference ID: <code>{error.digest}</code>
          </div>
        )}

        {/* Action Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            maxWidth: "360px",
            margin: "0 auto",
          }}
        >
          <button
            type="button"
            id="error-try-again-btn"
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              backgroundColor: "#4F7CFF",
              color: "#FFFFFF",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
          >
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <Link
              href="/"
              id="error-home-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "10px 16px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#F0F2F5",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <Home size={14} />
              <span>Home</span>
            </Link>

            <Link
              href="/blog"
              id="error-blog-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "10px 16px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#F0F2F5",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <BookOpen size={14} />
              <span>Perspectives</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
