/**
 * blogUtils.js
 * Comprehensive utilities for Lokesh Sain — Perspectives editorial blog
 * - Safe slugification
 * - Word count & reading time estimation
 * - Safe markdown-to-HTML parser with XSS defense and semantic structure
 * - Date formatters
 */

export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function estimateReadingTime(content = "") {
  const plainText = content.replace(/[#*`_~\[\]()>-]/g, " ");
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function formatDate(dateInput, options = {}) {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: options.month || "long",
      day: options.day || "numeric",
      year: options.year || "numeric",
      timeZone: options.timeZone || "UTC",
    }).format(d);
  } catch {
    return "";
  }
}

/**
 * Escapes unsafe HTML characters to prevent XSS
 */
export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates that a link URL is safe (http, https, mailto, or relative anchor/path)
 */
export function sanitizeUrl(url) {
  if (!url) return "#";
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:")
  ) {
    return "#";
  }
  return trimmed;
}

/**
 * Lightweight, semantic Markdown to safe HTML compiler for editorial articles.
 * Strictly sanitizes raw input and handles:
 * - Headers (H2, H3, H4) — H1 is reserved for page title
 * - Blockquotes and Pull Quotes
 * - Unordered and Ordered Lists
 * - Tables
 * - Bold, Italic, Code, Links
 * - Paragraphs
 */
export function parseMarkdownToHtml(markdown = "") {
  if (!markdown) return "";

  // Split into lines for block-level parsing
  const rawLines = markdown.split(/\r?\n/);
  const blocks = [];
  let currentList = null; // { type: 'ul'|'ol', items: [] }
  let currentTable = null; // { headers: [], rows: [] }
  let currentParagraph = [];
  let inCodeBlock = false;
  let codeBlockLines = [];

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ").trim();
      if (text) {
        blocks.push(`<p>${formatInline(text)}</p>`);
      }
      currentParagraph = [];
    }
  }

  function flushList() {
    if (currentList) {
      const itemsHtml = currentList.items
        .map((it) => `<li>${formatInline(it)}</li>`)
        .join("\n");
      blocks.push(`<${currentList.type}>${itemsHtml}</${currentList.type}>`);
      currentList = null;
    }
  }

  function flushTable() {
    if (currentTable) {
      const thead = currentTable.headers
        .map((h) => `<th>${formatInline(h)}</th>`)
        .join("");
      const tbody = currentTable.rows
        .map(
          (r) =>
            `<tr>${r.map((c) => `<td>${formatInline(c)}</td>`).join("")}</tr>`
        )
        .join("\n");
      blocks.push(
        `<div class="editorial-table-wrapper"><table class="editorial-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`
      );
      currentTable = null;
    }
  }

  function flushCodeBlock() {
    if (inCodeBlock) {
      const escapedCode = escapeHtml(codeBlockLines.join("\n"));
      blocks.push(
        `<div class="editorial-code-wrapper"><pre class="editorial-pre"><code class="editorial-code-block">${escapedCode}</code></pre></div>`
      );
      inCodeBlock = false;
      codeBlockLines = [];
    }
  }

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // Fenced Code Block delimiter
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushParagraph();
        flushList();
        flushTable();
        inCodeBlock = true;
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Blank line
    if (!trimmed) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushTable();
      const level = Math.min(6, Math.max(2, headingMatch[1].length)); // Normalize to H2-H6 for semantics
      const text = headingMatch[2].trim();
      blocks.push(`<h${level}>${formatInline(text)}</h${level}>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      flushTable();
      const quoteText = trimmed.replace(/^>\s?/, "").trim();
      blocks.push(
        `<blockquote class="editorial-quote"><p>${formatInline(
          quoteText
        )}</p></blockquote>`
      );
      continue;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushTable();
      blocks.push('<hr class="editorial-divider" />');
      continue;
    }

    // Table row detection (| col 1 | col 2 |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushParagraph();
      flushList();
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // Check if separator line (e.g. |---|---|)
      const isSep = cells.every((c) => /^:?-+:?$/.test(c));
      if (isSep) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    }

    // List item (Unordered: - or *, Ordered: 1.)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);

    if (ulMatch) {
      flushParagraph();
      flushTable();
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    if (olMatch) {
      flushParagraph();
      flushTable();
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    // Regular line -> collect for paragraph
    flushList();
    flushTable();
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushTable();
  flushCodeBlock();

  return blocks.join("\n\n");
}

/**
 * Formats inline Markdown safely:
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Code: `code`
 * - Links: [text](url)
 * - Images: ![alt](url)
 */
function formatInline(text = "") {
  // First escape raw HTML
  let escaped = escapeHtml(text);

  // Inline images ![alt](url) - must be before links
  escaped = escaped.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const safeUrl = sanitizeUrl(url);
    return `<img src="${safeUrl}" alt="${alt}" class="editorial-inline-img" loading="lazy" />`;
  });

  // Inline code `code`
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="editorial-code">$1</code>');

  // Bold **bold**
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  escaped = escaped.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // Italic *italic*
  escaped = escaped.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  escaped = escaped.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Links [text](url)
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    const safeUrl = sanitizeUrl(url);
    const isExternal = safeUrl.startsWith("http");
    return `<a href="${safeUrl}"${
      isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""
    } class="editorial-link">${linkText}</a>`;
  });

  return escaped;
}
