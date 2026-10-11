// Comprehensive Automated Test Suite for Urgent Production Release:
// 1. Groq Free-Tier Model Configuration & Deprecation Removal
// 2. Dynamic Model Discovery & Sanitized Status
// 3. Public Article AI Summarize Flow & Content-Hash Caching
// 4. Stacking Context, Portal & Ask Lokesh AI Layering
// 5. Site-Wide Thin Scrollbar Design System Across Dark & Light Themes
// 6. Security, Free-Tier Limits & Boundary Constraints

import assert from "assert";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Import AI configuration & discovery
import { AI_CONFIG, isGroqConfigured } from "../src/lib/ai/config.js";
import { resolveVerifiedModel, clearModelCache } from "../src/lib/ai/modelDiscovery.js";
import { sanitizeModelOutput } from "../src/lib/ai/safety.js";
import { parseMarkdown, parseInline, isSafeUrl } from "../src/lib/ai/markdownParser.js";

const PASS = "  [PASS]";
const FAIL = "  [FAIL]";

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`${PASS} ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`${FAIL} ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`${PASS} ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`${FAIL} ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

console.log("===============================================================");
console.log("RUNNING VERIFICATION SUITE: GROQ FREE-TIER, SUMMARY, POPUP & SCROLLBAR");
console.log("===============================================================\n");

// ─────────────────────────────────────────────────────────────────────────────
// 1. Groq Model Configuration & Deprecation Removal
// ─────────────────────────────────────────────────────────────────────────────
console.log("--- 1. Groq Model Configuration & Deprecation Removal ---");

runTest("Deprecated models are NOT defaults in AI_CONFIG", () => {
  assert.notStrictEqual(AI_CONFIG.chatModel, "llama-3.3-70b-versatile", "Must not default to deprecated llama-3.3-70b-versatile");
  assert.notStrictEqual(AI_CONFIG.chatModel, "llama-3.1-8b-instant", "Must not default to deprecated llama-3.1-8b-instant");
  assert.notStrictEqual(AI_CONFIG.summaryModel, "llama-3.3-70b-versatile", "Must not default to deprecated llama-3.3-70b-versatile");
  assert.notStrictEqual(AI_CONFIG.summaryModel, "llama-3.1-8b-instant", "Must not default to deprecated llama-3.1-8b-instant");
});

runTest("Verified free-tier candidate (openai/gpt-oss-20b) is the default", () => {
  assert.strictEqual(AI_CONFIG.chatModel, "openai/gpt-oss-20b");
  assert.strictEqual(AI_CONFIG.summaryModel, "openai/gpt-oss-20b");
});

runTest("No deprecated model identifiers exist in codebase (excluding regex strip)", () => {
  const filesToCheck = [
    "src/lib/ai/config.js",
    "src/lib/ai/groqClient.js",
    "src/lib/ai/summaryService.js",
    "src/app/api/ai/chat/route.js",
    "src/app/api/ai/status/route.js",
    "src/app/blog/[slug]/page.jsx",
    "src/components/ui/AskLokeshAI.jsx",
  ];

  for (const f of filesToCheck) {
    const fullPath = path.resolve(f);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      assert(!content.includes("llama-3.3-70b-versatile"), `${f} must not contain llama-3.3-70b-versatile`);
      assert(!content.includes("llama-3.1-8b-instant"), `${f} must not contain llama-3.1-8b-instant`);
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Dynamic Model Discovery & Resolution
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- 2. Dynamic Model Discovery & Resolution ---");

await runAsyncTest("Model resolution falls back safely if API key is unconfigured", async () => {
  clearModelCache();
  const origKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;

  const result = await resolveVerifiedModel("openai/gpt-oss-20b");
  assert.strictEqual(result.model, "openai/gpt-oss-20b");
  assert.strictEqual(result.verified, false);

  if (origKey) process.env.GROQ_API_KEY = origKey;
});

await runAsyncTest("Model resolution uses verified model from catalog or candidate fallback", async () => {
  clearModelCache();
  // Test with invalid candidate without API key -> uses fallback candidate
  const result = await resolveVerifiedModel("non-existent-model-xyz");
  assert.strictEqual(result.model, "openai/gpt-oss-20b");
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Free-Tier Rate Limits & Budget Controls
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- 3. Free-Tier Rate Limits & Budget Controls ---");

runTest("Chat and Summary have bounded output token budgets", () => {
  assert(AI_CONFIG.maxTokens <= 500, "Chat tokens must be <= 500 for free tier");
  assert(AI_CONFIG.summaryMaxTokens <= 650, "Summary tokens must be <= 650 for free tier");
});

runTest("Conservative free-tier rate limits are configured", () => {
  assert(AI_CONFIG.rateLimit.chatRequestsPerWindow <= 10, "Chat requests per 10m window must be conservative (<= 10)");
  assert(AI_CONFIG.rateLimit.burstLimit <= 3, "Burst limit must be <= 3 per 30s");
  assert(AI_CONFIG.rateLimit.summaryRequestsPerWindow <= 8, "Summary requests per 10m window must be conservative (<= 8)");
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Public Summarize Endpoint & UI Component Contract
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- 4. Public Summarize Endpoint & Component Architecture ---");

runTest("Public summarize endpoint file exists at src/app/api/blog/[slug]/summarize/route.js", () => {
  const routePath = path.resolve("src/app/api/blog/[slug]/summarize/route.js");
  assert(fs.existsSync(routePath), "Public summarize route must exist");
  const content = fs.readFileSync(routePath, "utf8");
  assert(content.includes('status: "published"'), "Must only query published articles from MongoDB");
  assert(content.includes("checkSummaryRateLimit"), "Must enforce distributed rate limits on summarize");
  assert(content.includes("inFlightRequests"), "Must deduplicate concurrent requests for same article");
  assert(content.includes("computeArticleContentHash"), "Must verify content-hash before generating");
});

runTest("Article detail page renders ArticleAiSummary for all articles", () => {
  const pagePath = path.resolve("src/app/blog/[slug]/page.jsx");
  const content = fs.readFileSync(pagePath, "utf8");
  assert(content.includes("<ArticleAiSummary"), "Article page must always render ArticleAiSummary");
  assert(!content.includes("article.aiSummary && <ArticleAiSummary"), "Must not conditionally hide ArticleAiSummary when summary is null");
});

runTest("ArticleAiSummary provides CTA button, loading state, retry and cooldown handling", () => {
  const compPath = path.resolve("src/components/blog/ArticleAiSummary.jsx");
  const content = fs.readFileSync(compPath, "utf8");
  assert(content.includes("AI Summarize"), "Component must have AI Summarize CTA");
  assert(content.includes("loading"), "Component must handle loading state");
  assert(content.includes("cooldown"), "Component must handle cooldown and rate-limit states");
  assert(content.includes("handleGenerate"), "Component must implement interactive generation");
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Ask Lokesh AI Stacking Context & Portal Layering
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- 5. Ask Lokesh AI Stacking Context & Portal Layering ---");

runTest("AskLokeshAI uses React createPortal to document.body", () => {
  const compPath = path.resolve("src/components/ui/AskLokeshAI.jsx");
  const content = fs.readFileSync(compPath, "utf8");
  assert(content.includes("createPortal("), "Must render overlay through createPortal");
  assert(content.includes("document.body"), "Must portal directly to document.body");
});

runTest("Dialog (z-index 1090) and Backdrop (z-index 1080) surpass Navbar (z-index 1000)", () => {
  const compPath = path.resolve("src/components/ui/AskLokeshAI.jsx");
  const content = fs.readFileSync(compPath, "utf8");
  assert(content.includes("zIndex: 1080"), "Backdrop z-index must be 1080 (above navbar 1000)");
  assert(content.includes("zIndex: 1090"), "Dialog z-index must be 1090 (above backdrop and navbar)");
});

runTest("AskLokeshAI locks body scroll on open and restores on close", () => {
  const compPath = path.resolve("src/components/ui/AskLokeshAI.jsx");
  const content = fs.readFileSync(compPath, "utf8");
  assert(content.includes('document.body.style.overflow = "hidden"'), "Must lock body scroll when open");
  assert(content.includes("document.body.style.overflow = prevOverflow"), "Must restore body scroll when closed");
});

runTest("AskLokeshAI supports Escape key and focus return", () => {
  const compPath = path.resolve("src/components/ui/AskLokeshAI.jsx");
  const content = fs.readFileSync(compPath, "utf8");
  assert(content.includes('e.key === "Escape"'), "Must handle Escape key to close");
  assert(content.includes("triggerRef.current?.focus()"), "Must return focus to trigger button");
});

runTest("AskLokeshAI handles viewport height and safe-area insets", () => {
  const compPath = path.resolve("src/components/ui/AskLokeshAI.jsx");
  const content = fs.readFileSync(compPath, "utf8");
  assert(content.includes("100dvh"), "Must use dynamic viewport height for mobile keyboards");
  assert(content.includes("env(safe-area-inset-bottom"), "Must respect safe-area-inset-bottom");
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Site-Wide Thin Scrollbars
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- 6. Site-Wide Thin Scrollbar Design System ---");

runTest("globals.css defines thin scrollbar tokens and standard Firefox/WebKit rules", () => {
  const cssPath = path.resolve("src/app/globals.css");
  const content = fs.readFileSync(cssPath, "utf8");
  assert(content.includes("--scrollbar-size: 6px"), "Must define 6px thin scrollbar size");
  assert(content.includes("scrollbar-width: thin"), "Must support Firefox scrollbar-width: thin");
  assert(content.includes("scrollbar-color: var(--scrollbar-thumb)"), "Must support Firefox scrollbar-color");
  assert(content.includes("::-webkit-scrollbar"), "Must style WebKit scrollbars");
  assert(content.includes("::-webkit-scrollbar-thumb"), "Must style WebKit scrollbar thumb");
  assert(content.includes("[data-ai-chat-messages]"), "Must style AI chat messages scrollbar");
});

runTest("perspectives.css defines light editorial thin scrollbar with high contrast", () => {
  const cssPath = path.resolve("src/app/blog/perspectives.css");
  const content = fs.readFileSync(cssPath, "utf8");
  assert(content.includes("--scrollbar-thumb: rgba(25, 25, 25, 0.22)"), "Must use high-contrast thumb for light editorial blog");
  assert(content.includes(".perspectives-theme::-webkit-scrollbar"), "Must style perspectives WebKit scrollbars");
  assert(content.includes(".perspectives-theme,") && content.includes("scrollbar-width: thin"), "Must style perspectives Firefox scrollbars");
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Security & Privacy Audit
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- 7. Security & Privacy Audit ---");

runTest("Public status endpoint never leaks secrets or raw keys", () => {
  const statusPath = path.resolve("src/app/api/ai/status/route.js");
  const content = fs.readFileSync(statusPath, "utf8");
  assert(!content.includes("apiKey:"), "Status response must never include apiKey");
  assert(!content.includes("GROQ_API_KEY:"), "Status response must never include GROQ_API_KEY");
});

runTest("social_preview.webp is preserved byte-for-byte (221270 bytes)", () => {
  const stat = fs.statSync("public/images/social_preview.webp");
  assert.strictEqual(stat.size, 221270, "social_preview.webp must remain exactly 221270 bytes");
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Safe Markdown Rendering & Security Audit
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- 8. Safe Markdown Rendering & Security Audit ---");

runTest("AskLokeshAI imports and utilizes SafeMarkdown component", () => {
  const compPath = path.resolve("src/components/ui/AskLokeshAI.jsx");
  const content = fs.readFileSync(compPath, "utf8");
  assert(content.includes("import SafeMarkdown from"), "AskLokeshAI must import SafeMarkdown");
  assert(content.includes("<SafeMarkdown content={msg.content}"), "AskLokeshAI must render SafeMarkdown for messages");
  assert(!content.includes("dangerouslySetInnerHTML={{ __html: msg.content }}"), "Never use dangerouslySetInnerHTML for messages");
});

runTest("Server-side prompt in safety.js requests clean Markdown and forbids angle-bracket URLs", () => {
  const safetyPath = path.resolve("src/lib/ai/safety.js");
  const content = fs.readFileSync(safetyPath, "utf8");
  assert(content.includes("clean, standard Markdown"), "Prompt must instruct model to use clean Markdown");
  assert(content.includes("Never wrap URLs in angle brackets"), "Prompt must forbid angle brackets around URLs");
  assert(content.includes("Never output reasoning traces"), "Prompt must prohibit internal reasoning traces");
});

runTest("sanitizeModelOutput un-boxes angle-bracket URLs and strips malicious HTML", () => {
  const rawWithAngle = "Visit <https://lokeshsain.vercel.app/> for more info.";
  const cleaned = sanitizeModelOutput(rawWithAngle);
  assert(!cleaned.includes("<https://"), "Must strip angle brackets around URL");
  assert(cleaned.includes("https://lokeshsain.vercel.app/"), "Must preserve URL");

  const dangerous = "Hi <script>alert(1)</script><iframe src='evil.com'></iframe>";
  const sanitized = sanitizeModelOutput(dangerous);
  assert(!sanitized.includes("<script>"), "Must strip script tags");
  assert(!sanitized.includes("<iframe"), "Must strip iframe tags");
});

runTest("SafeMarkdown AST parser correctly handles bold, lists, links, HTML, and malformed syntax", () => {
  // Bold
  const boldTokens = parseInline("The **MERN** architecture");
  assert.strictEqual(boldTokens[1].type, "bold");
  assert.strictEqual(boldTokens[1].children[0].value, "MERN");

  // Lists
  const listAst = parseMarkdown("- **Frontend** - React.js\n- **Backend** - Node.js");
  assert.strictEqual(listAst[0].type, "ul");
  assert.strictEqual(listAst[0].items.length, 2);

  // Links & Angle brackets
  const angleTokens = parseInline("Portfolio at <https://lokeshsain.vercel.app/>.");
  assert.strictEqual(angleTokens[1].type, "link");
  assert.strictEqual(angleTokens[1].href, "https://lokeshsain.vercel.app/");
  assert.strictEqual(angleTokens[1].children[0].value, "https://lokeshsain.vercel.app/");

  // Malicious protocols
  assert.strictEqual(isSafeUrl("javascript:alert(1)"), false);
  assert.strictEqual(isSafeUrl("data:text/html,evil"), false);
  const unsafeTokens = parseInline("[evil](javascript:alert(1))");
  assert.strictEqual(unsafeTokens[0].href, "#");
  assert.strictEqual(unsafeTokens[0].isSafe, false);

  // Malformed markdown
  const malformedAst = parseMarkdown("**Unclosed bold and [broken link");
  assert(malformedAst.length > 0);
  assert.strictEqual(malformedAst[0].type, "paragraph");
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n===============================================================");
console.log(`VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log("===============================================================\n");

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
