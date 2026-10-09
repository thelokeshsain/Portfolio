"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log root layout runtime exceptions safely
    console.error("Critical root-layout error caught by global-error boundary:", {
      digest: error?.digest || "unknown",
      message: error?.message || "Critical layout error",
    });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Application Error | Lokesh Sain</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          backgroundColor: "#05070A",
          color: "#F0F2F5",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "90%",
            textAlign: "center",
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "40px 24px",
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.7)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(248, 113, 113, 0.15)",
              color: "#F87171",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            !
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              margin: "0 0 10px",
              color: "#F0F2F5",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              color: "#94A3B8",
              fontSize: "14px",
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            A critical system error occurred while rendering the page layout. You may retry reloading the view or navigate back to the main homepage.
          </p>

          {error?.digest && (
            <div
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#64748B",
                marginBottom: "24px",
              }}
            >
              Digest: {error.digest}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "280px",
              margin: "0 auto",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                backgroundColor: "#4F7CFF",
                color: "#FFFFFF",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>

            <Link
              href="/"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "#F0F2F5",
                fontSize: "13px",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
