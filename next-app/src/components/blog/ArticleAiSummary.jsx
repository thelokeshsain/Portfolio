import React from "react";
import { Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ArticleAiSummary({ aiSummary }) {
  if (!aiSummary || !aiSummary.summary) {
    return null;
  }

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
              fontSize: "15px",
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

        {aiSummary.model && (
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
            Groq &middot; {aiSummary.model.replace(/^meta-llama\//, "")}
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
        {aiSummary.summary}
      </p>

      {aiSummary.keyPoints && aiSummary.keyPoints.length > 0 && (
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
          {aiSummary.keyPoints.map((point, idx) => (
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
