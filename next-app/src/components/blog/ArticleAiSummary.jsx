"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

export default function ArticleAiSummary({ initialSummary, slug }) {
  const [summaryData, setSummaryData] = useState(initialSummary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const handleGenerate = async () => {
    if (loading || cooldown > 0 || !slug) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          const retrySec = data.retryAfter || 30;
          setCooldown(retrySec);
          // Countdown timer
          const interval = setInterval(() => {
            setCooldown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        throw new Error(data.message || data.error || "Failed to generate summary.");
      }

      setSummaryData({
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        model: data.model,
        generatedAt: data.generatedAt,
      });
    } catch (err) {
      setError(err.message || "AI summarization service is temporarily busy. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // If a summary is available (either initially or just generated)
  if (summaryData && summaryData.summary) {
    return (
      <section
        className="p-ai-summary-card"
        aria-label="Editorial AI Summary"
        style={{
          margin: "0 0 36px",
          padding: "24px",
          background: "var(--p-surface, #FFFFFF)",
          border: "1px solid var(--p-border, #E5E1D8)",
          borderLeft: "4px solid var(--p-accent, #1B4D3E)",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "14px",
            paddingBottom: "10px",
            borderBottom: "1px solid var(--p-border-subtle, #EFECE6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} style={{ color: "var(--p-accent, #1B4D3E)" }} />
            <h2
              style={{
                fontFamily: "var(--font-display, inherit)",
                fontSize: "14.5px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "var(--p-text-primary, #1A1A1A)",
                margin: 0,
              }}
            >
              Editorial AI Synthesis &middot; Key Takeaways
            </h2>
          </div>

          {summaryData.model && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "4px",
                background: "var(--p-muted-surface, #F5EFE6)",
                color: "var(--p-text-muted, #766F6B)",
                letterSpacing: "0.02em",
              }}
            >
              Groq &middot; {summaryData.model.replace(/^openai\//, "").replace(/^meta-llama\//, "")}
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: "15px",
            lineHeight: "1.65",
            color: "var(--p-text-primary, #1A1A1A)",
            margin: "0 0 16px",
            fontWeight: 450,
          }}
        >
          {summaryData.summary}
        </p>

        {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
          <ul
            style={{
              margin: "0 0 16px",
              paddingLeft: "0",
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {summaryData.keyPoints.map((point, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontSize: "14px",
                  lineHeight: "1.55",
                  color: "var(--p-text-secondary, #4A4A4A)",
                }}
              >
                <CheckCircle2
                  size={15}
                  style={{
                    color: "var(--p-accent, #1B4D3E)",
                    flexShrink: 0,
                    marginTop: "3px",
                  }}
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11.5px",
            color: "var(--p-text-muted, #766F6B)",
            borderTop: "1px dashed var(--p-border-subtle, #EFECE6)",
            paddingTop: "10px",
          }}
        >
          <ShieldCheck size={13} style={{ flexShrink: 0 }} />
          <span>
            Synthesized from the published article using Groq AI. Always refer to the full analysis and primary sources below.
          </span>
        </div>
      </section>
    );
  }

  // Initial State: "AI Summarize" CTA card displayed on every published article
  return (
    <section
      className="p-ai-summary-cta"
      aria-label="Generate AI Summary"
      style={{
        margin: "0 0 36px",
        padding: "20px 24px",
        background: "var(--p-surface, #FFFFFF)",
        border: "1px solid var(--p-border, #E5E1D8)",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <Sparkles size={16} style={{ color: "var(--p-accent, #1B4D3E)" }} />
            <span
              style={{
                fontFamily: "var(--font-display, inherit)",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--p-text-primary, #1A1A1A)",
                letterSpacing: "0.01em",
              }}
            >
              Executive AI Synthesis
            </span>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: "4px",
                background: "var(--p-muted-surface, #F5EFE6)",
                color: "var(--p-text-muted, #766F6B)",
              }}
            >
              Instant Takeaways
            </span>
          </div>
          <p
            style={{
              fontSize: "13.5px",
              lineHeight: "1.5",
              color: "var(--p-text-secondary, #4A4A4A)",
              margin: 0,
            }}
          >
            Generate a fast, verified summary of this analysis and its primary distinctions using Groq AI.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || cooldown > 0}
          aria-label="Generate AI summary for this article"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            background: loading || cooldown > 0 ? "var(--p-border, #E5E1D8)" : "var(--p-accent, #1B4D3E)",
            color: loading || cooldown > 0 ? "var(--p-text-muted, #766F6B)" : "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: loading || cooldown > 0 ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            boxShadow: loading || cooldown > 0 ? "none" : "0 2px 6px rgba(27, 77, 62, 0.2)",
            outlineOffset: "2px",
          }}
          onMouseEnter={(e) => {
            if (!loading && cooldown === 0) e.currentTarget.style.filter = "brightness(1.1)";
          }}
          onMouseLeave={(e) => {
            if (!loading && cooldown === 0) e.currentTarget.style.filter = "none";
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              <span>Synthesizing...</span>
            </>
          ) : cooldown > 0 ? (
            <span>Cooldown ({cooldown}s)</span>
          ) : (
            <>
              <Sparkles size={14} />
              <span>AI Summarize</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: "14px",
            padding: "10px 14px",
            borderRadius: "6px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            fontSize: "12.5px",
            color: "#991B1B",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          {cooldown === 0 && (
            <button
              type="button"
              onClick={handleGenerate}
              style={{
                background: "transparent",
                border: "none",
                color: "#991B1B",
                textDecoration: "underline",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </section>
  );
}
