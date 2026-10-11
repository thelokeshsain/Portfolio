"use client";

import React, { useMemo } from "react";
import { parseMarkdown } from "@/lib/ai/markdownParser";

function renderInlineNode(node, index) {
  if (!node) return null;

  switch (node.type) {
    case "text":
      return <React.Fragment key={index}>{node.value || ""}</React.Fragment>;

    case "bold":
      return (
        <strong key={index} style={{ fontWeight: 650, color: "#FFFFFF" }}>
          {Array.isArray(node.children) ? node.children.map(renderInlineNode) : null}
        </strong>
      );

    case "italic":
      return (
        <em key={index} style={{ fontStyle: "italic", color: "#E2E8F0" }}>
          {Array.isArray(node.children) ? node.children.map(renderInlineNode) : null}
        </em>
      );

    case "code":
      return (
        <code
          key={index}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            padding: "2px 5px",
            borderRadius: "4px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "12px",
            color: "#93C5FD",
          }}
        >
          {node.value || ""}
        </code>
      );

    case "link": {
      const href = typeof node.href === "string" && node.href ? node.href : "#";
      const isInternal = href.startsWith("/") || href.startsWith("#");
      const labelText = typeof node.children?.[0]?.value === "string" ? node.children[0].value : "Link";
      return (
        <a
          key={index}
          href={href}
          target={isInternal ? "_self" : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          aria-label={isInternal ? labelText : `${labelText} (opens in a new tab)`}
          style={{
            color: "#38BDF8",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            cursor: "pointer",
            fontWeight: 500,
            outlineOffset: "2px",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#7DD3FC")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#38BDF8")}
        >
          {Array.isArray(node.children) ? node.children.map(renderInlineNode) : labelText}
        </a>
      );
    }

    default:
      return null;
  }
}

export default function SafeMarkdown({ content, style = {} }) {
  const blocks = useMemo(() => {
    try {
      return parseMarkdown(content || "");
    } catch (err) {
      console.error("SafeMarkdown parsing error:", err);
      return [{ type: "paragraph", children: [{ type: "text", value: content || "" }] }];
    }
  }, [content]);

  if (!content) return null;

  return (
    <div
      className="safe-markdown-content"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        fontSize: "13px",
        lineHeight: 1.6,
        color: "#F1F5F9",
        wordBreak: "break-word",
        ...style,
      }}
    >
      {blocks.map((block, bIdx) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={bIdx}
                style={{
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {block.children?.map(renderInlineNode)}
              </p>
            );

          case "ul":
            return (
              <ul
                key={bIdx}
                style={{
                  margin: 0,
                  paddingLeft: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  listStyleType: "disc",
                }}
              >
                {block.items.map((itemNodes, iIdx) => (
                  <li key={iIdx} style={{ lineHeight: 1.55 }}>
                    {itemNodes.map(renderInlineNode)}
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol
                key={bIdx}
                style={{
                  margin: 0,
                  paddingLeft: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  listStyleType: "decimal",
                }}
              >
                {block.items.map((itemNodes, iIdx) => (
                  <li key={iIdx} style={{ lineHeight: 1.55 }}>
                    {itemNodes.map(renderInlineNode)}
                  </li>
                ))}
              </ol>
            );

          case "heading": {
            const fontSize = block.level === 1 ? "16px" : block.level === 2 ? "15px" : "14px";
            return (
              <h3
                key={bIdx}
                style={{
                  margin: "4px 0 0",
                  fontSize,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.01em",
                }}
              >
                {block.children?.map(renderInlineNode)}
              </h3>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
