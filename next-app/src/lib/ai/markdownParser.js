// Safe, zero-dependency Markdown AST Parser for Ask Lokesh AI
// Compliant with React 19 / Next.js 16 App Router.
// Disables raw HTML execution. Strictly sanitizes link protocols.

/**
 * Validates link destination against safe protocols.
 * Only permits http:, https:, mailto:, and relative internal paths (/ or #).
 */
export function isSafeUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  // Permit safe internal relative paths
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return true;
  }

  // Reject javascript:, data:, vbscript:, etc.
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:" || parsed.protocol === "mailto:";
  } catch {
    return false;
  }
}

/**
 * Strips raw HTML tags and dangerous elements from input string to eliminate any injection vector.
 */
export function stripRawHtml(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<(?:\/?[a-zA-Z][^>]*|!--[\s\S]*?--)>/g, "");
}

/**
 * Parses inline formatting:
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Code: `code`
 * - Links: [label](url)
 * - Angle-bracket URLs: <https://...>
 * - Raw URLs: https://...
 * - Escaped / stripped HTML
 */
export function parseInline(text) {
  if (!text || typeof text !== "string") return [];

  // 1. Identify angle-bracket URLs and normalize: <https://example.com> -> [https://example.com](https://example.com)
  let normalized = text.replace(/<(https?:\/\/[^\s>]+)>/g, "[$1]($1)");

  // 2. Strip any remaining raw HTML tags (e.g. <script>, <img ...>, <div>)
  normalized = stripRawHtml(normalized);

  const tokens = [];

  // Regex matching inline formatting tokens in order of precedence:
  // 1. Markdown link: \[([^\]]+)\]\(([^)\s]+)\)
  // 2. Bold: \*\*([^*]+)\*\* or __([^_]+)__
  // 3. Inline code: `([^`]+)`
  // 4. Italic: \*([^*]+)\* or _([^_]+)_
  // 5. Bare URL: (https?:\/\/[^\s<>'")]*[^\s<>'",.?!:;])
  const inlineRegex = /(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_|(https?:\/\/[^\s<>'")]*[^\s<>'",.?!:;]))/g;

  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(normalized)) !== null) {
    const matchIndex = match.index;

    // Push preceding text if any
    if (matchIndex > lastIndex) {
      tokens.push({
        type: "text",
        value: normalized.slice(lastIndex, matchIndex),
      });
    }

    const fullMatch = match[0];

    if (match[1]) {
      // Markdown Link: [label](url)
      const label = match[2];
      const rawUrl = match[3];
      const safe = isSafeUrl(rawUrl);

      // Flattens any nested links inside label into text
      const rawChildren = parseInline(label);
      const labelChildren = rawChildren.flatMap((c) => {
        if (c.type === "link") return c.children || [{ type: "text", value: c.href }];
        return [c];
      });

      tokens.push({
        type: "link",
        href: safe ? rawUrl : "#",
        isSafe: safe,
        children: labelChildren.length > 0 ? labelChildren : [{ type: "text", value: label }],
      });
    } else if (match[5] || match[6]) {
      // Bold: **text** or __text__
      const boldContent = match[5] || match[6];
      tokens.push({
        type: "bold",
        children: parseInline(boldContent),
      });
    } else if (match[7]) {
      // Inline Code: `code`
      tokens.push({
        type: "code",
        value: match[7],
      });
    } else if (match[8] || match[9]) {
      // Italic: *text* or _text_
      const italicContent = match[8] || match[9];
      tokens.push({
        type: "italic",
        children: parseInline(italicContent),
      });
    } else if (match[10]) {
      // Bare URL
      const url = match[10];
      const safe = isSafeUrl(url);
      tokens.push({
        type: "link",
        href: safe ? url : "#",
        isSafe: safe,
        children: [{ type: "text", value: url }],
      });
    }

    lastIndex = inlineRegex.lastIndex;
  }

  // Push remaining text
  if (lastIndex < normalized.length) {
    tokens.push({
      type: "text",
      value: normalized.slice(lastIndex),
    });
  }

  return tokens;
}

/**
 * Parses block-level structure:
 * - Paragraphs
 * - Unordered lists (- or *)
 * - Ordered lists (1., 2.)
 * - Headings (#, ##, ###)
 */
export function parseMarkdown(markdown) {
  if (!markdown || typeof markdown !== "string") return [];

  // Normalize line endings
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const blocks = [];
  let currentList = null; // { type: 'ul' | 'ol', items: [] }
  let currentParagraphLines = [];

  function flushParagraph() {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join("\n").trim();
      if (text) {
        blocks.push({
          type: "paragraph",
          children: parseInline(text),
        });
      }
      currentParagraphLines = [];
    }
  }

  function flushList() {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line -> flush blocks
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Unordered list item: - item or * item
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(parseInline(ulMatch[1]));
      continue;
    }

    // Ordered list item: 1. item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(parseInline(olMatch[2]));
      continue;
    }

    // Heading: ### Heading or ## Heading or # Heading
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        children: parseInline(headingMatch[2]),
      });
      continue;
    }

    // Regular text line -> accumulates in current paragraph
    flushList();
    currentParagraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}
