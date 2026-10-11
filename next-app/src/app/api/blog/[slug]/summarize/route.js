// Public Route Handler for Visitor AI Summarize Request on Published Perspectives
// Validates published status, enforces content-hash caching, and applies distributed rate limits.

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import { checkChatRateLimit, checkSummaryRateLimit } from "@/lib/ai/rateLimiter.js";
import { getOrGenerateArticleSummary, computeArticleContentHash } from "@/lib/ai/summaryService.js";

export const dynamic = "force-dynamic";

// In-flight concurrency lock to deduplicate simultaneous requests for the same article
const inFlightRequests = new Map();

export async function POST(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "INVALID_SLUG", message: "A valid article slug is required." },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Authoritative retrieval: Fetch strictly published article from database
    const article = await Article.findOne({ slug, status: "published" });

    if (!article) {
      return NextResponse.json(
        {
          error: "ARTICLE_NOT_FOUND",
          message: "Article was not found or is not currently published.",
        },
        { status: 404 }
      );
    }

    const currentHash = computeArticleContentHash(article.title, article.dek, article.content);

    // 2. Cache-first check: Return immediately if content-hash matches without touching Groq
    const hasValidCache =
      article.aiSummary?.contentHash === currentHash &&
      article.aiSummary?.summary &&
      article.aiSummary.summary.length > 50;

    if (hasValidCache) {
      return NextResponse.json(
        {
          success: true,
          cached: true,
          summary: article.aiSummary.summary,
          keyPoints: article.aiSummary.keyPoints || [],
          model: article.aiSummary.model,
          generatedAt: article.aiSummary.generatedAt,
        },
        {
          status: 200,
          headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
        }
      );
    }

    // 3. Enforce distributed rate limits for visitor on the free plan
    const visitorRate = await checkChatRateLimit(request);
    if (!visitorRate.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: "AI summarization quota temporarily reached. Please retry in a few moments.",
          retryAfter: visitorRate.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(visitorRate.retryAfter),
            "Cache-Control": "private, no-store, max-age=0",
          },
        }
      );
    }

    // Article-level cooldown check
    const articleRate = await checkSummaryRateLimit(article._id.toString());
    if (!articleRate.allowed) {
      return NextResponse.json(
        {
          error: "ARTICLE_BUSY",
          message: "This perspective was recently summarized. Please retry shortly.",
          retryAfter: articleRate.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(articleRate.retryAfter),
            "Cache-Control": "private, no-store, max-age=0",
          },
        }
      );
    }

    // 4. In-flight request deduplication
    const articleId = article._id.toString();
    if (inFlightRequests.has(articleId)) {
      const existingPromise = inFlightRequests.get(articleId);
      const sharedResult = await existingPromise;
      return NextResponse.json(sharedResult, { status: sharedResult.statusCode || 200 });
    }

    // Launch generation and store promise in concurrency map (forceRegenerate if stored cache is invalid/truncated)
    const generationPromise = getOrGenerateArticleSummary(articleId, {
      forceRegenerate: !hasValidCache,
    });
    inFlightRequests.set(articleId, generationPromise);

    let result;
    try {
      result = await generationPromise;
    } finally {
      inFlightRequests.delete(articleId);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          message: result.message || "Failed to generate summary.",
        },
        {
          status: result.statusCode || 503,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        cached: result.cached,
        summary: result.summary,
        keyPoints: result.keyPoints || [],
        model: result.model,
        generatedAt: result.generatedAt,
      },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
      }
    );
  } catch (err) {
    console.error("Public summarize route error:", err.message);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "An unexpected error occurred during summarization." },
      { status: 500, headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  }
}
