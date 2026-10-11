// Article Summarization Service Layer
// Enforces content-hash caching, token budgets, and published-only guards.

import crypto from "crypto";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import { AI_CONFIG, isGroqConfigured, getSummaryModel } from "./config.js";
import { executeGroqCompletion } from "./groqClient.js";
import { sanitizeModelOutput } from "./safety.js";

if (typeof window !== "undefined") {
  throw new Error("Server-only module src/lib/ai/summaryService.js cannot be executed in the browser");
}

/**
 * Computes a deterministic SHA-256 hash of published article text.
 */
export function computeArticleContentHash(title, dek, content) {
  const normalized = `${(title || "").trim()}\n${(dek || "").trim()}\n${(content || "")
    .replace(/\r\n/g, "\n")
    .trim()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Normalizes article markdown body to clean, token-efficient text for model input.
 */
export function prepareContentForSummarization(content) {
  if (!content || typeof content !== "string") return "";

  return content
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // flatten markdown links to text
    .replace(/[#*`_~>]/g, "") // remove markdown styling
    .replace(/\n{3,}/g, "\n\n") // collapse multiple line breaks
    .slice(0, AI_CONFIG.MAX_SUMMARY_INPUT_CHARS)
    .trim();
}

/**
 * Generates or retrieves cached AI summary for an article by ID.
 * Reuses cached result if content hash is unchanged.
 */
export async function getOrGenerateArticleSummary(articleId, options = {}) {
  const { forceRegenerate = false } = options;

  await connectDB();
  const article = await Article.findById(articleId);

  if (!article) {
    return { success: false, error: "ARTICLE_NOT_FOUND", message: "Article not found", statusCode: 404 };
  }

  // Strict check: Only published articles may receive public AI summaries
  if (article.status !== "published") {
    return {
      success: false,
      error: "UNPUBLISHED_ARTICLE",
      message: "AI summaries can only be generated for published articles.",
      statusCode: 400,
    };
  }

  const currentHash = computeArticleContentHash(article.title, article.dek, article.content);

  // Cache hit verification: return existing summary if hash matches and not forced
  if (
    !forceRegenerate &&
    article.aiSummary?.contentHash === currentHash &&
    article.aiSummary?.summary &&
    article.aiSummary.summary.length > 50
  ) {
    return {
      success: true,
      cached: true,
      summary: article.aiSummary.summary,
      keyPoints: article.aiSummary.keyPoints || [],
      model: article.aiSummary.model,
      generatedAt: article.aiSummary.generatedAt,
      contentHash: currentHash,
    };
  }

  // If Groq is not configured, report clear graceful error without failing publish
  if (!isGroqConfigured()) {
    return {
      success: false,
      cached: false,
      error: "AI_NOT_CONFIGURED",
      message: "Groq API key is not configured in this environment.",
      statusCode: 503,
    };
  }

  const cleanBody = prepareContentForSummarization(article.content);
  const targetModel = getSummaryModel();

  const messages = [
    {
      role: "system",
      content: `You are an expert editorial research assistant for "Lokesh Sain — Perspectives", an independent publication covering technology, policy, and engineering.
Summarize the published article below.
Your summary must:
1. Explain the central thesis and primary facts clearly.
2. Highlight important distinctions (e.g. allegations vs confirmed actions, policy impacts).
3. Clearly indicate uncertainty where the text does.
4. Never invent facts, dates, legal conclusions, or quotes.
5. Provide a 2-3 sentence overview paragraph followed by exactly 3 bullet points starting with "- ".
Keep the entire output under 150 words.`,
    },
    {
      role: "user",
      content: `Article Title: ${article.title}
Editorial Dek: ${article.dek}
Category: ${article.category}

Article Content:
${cleanBody}`,
    },
  ];

  const result = await executeGroqCompletion({
    messages,
    model: targetModel,
    maxCompletionTokens: AI_CONFIG.MAX_SUMMARY_OUTPUT_TOKENS,
    temperature: 0.2, // Low temperature for high factual adherence
  });

  if (!result.success) {
    return {
      success: false,
      cached: false,
      error: result.error,
      message: result.message,
      statusCode: result.statusCode,
    };
  }

  const sanitized = sanitizeModelOutput(result.content);

  // Parse into overview and bullet points
  const lines = sanitized.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter((l) => l.startsWith("- ") || l.startsWith("* "));
  const paragraphLines = lines.filter((l) => !l.startsWith("- ") && !l.startsWith("* "));

  const summaryText = paragraphLines.join(" ") || sanitized;
  const keyPoints = bulletLines.map((b) => b.replace(/^[-*]\s*/, ""));

  // Persist into MongoDB only if summary is valid and substantial (> 50 chars)
  if (summaryText && summaryText.length > 50) {
    article.aiSummary = {
      summary: summaryText,
      keyPoints: keyPoints.slice(0, 4),
      contentHash: currentHash,
      model: result.model || targetModel,
      generatedAt: new Date(),
      inputTokens: result.usage?.promptTokens || 0,
      outputTokens: result.usage?.completionTokens || 0,
    };

    await article.save();
  }

  return {
    success: true,
    cached: false,
    summary: summaryText,
    keyPoints: article.aiSummary.keyPoints,
    model: article.aiSummary.model,
    generatedAt: article.aiSummary.generatedAt,
    contentHash: currentHash,
    usage: result.usage,
  };
}
