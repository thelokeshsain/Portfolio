// Authenticated Admin Route Handler for AI Article Summary Generation / Regeneration
// Enforces JWT admin verification, article-level rate limits, and content-hash caching.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getOrGenerateArticleSummary } from "@/lib/ai/summaryService";
import { checkSummaryRateLimit } from "@/lib/ai/rateLimiter";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    // 1. Verify Admin Authentication
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!id || id.length !== 24) {
      return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
    }

    // 2. Check summary rate limit
    const rateLimit = await checkSummaryRateLimit(id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many summary generation requests for this article. Please wait a few moments.",
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    // 3. Parse options
    let forceRegenerate = false;
    try {
      const body = await request.json();
      if (body && typeof body.force === "boolean") {
        forceRegenerate = body.force;
      }
    } catch {
      // Body is optional
    }

    // 4. Generate or fetch cached summary
    const result = await getOrGenerateArticleSummary(id, { forceRegenerate });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: result.statusCode || 500 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Admin summarize error:", err.message);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to generate article summary." },
      { status: 500 }
    );
  }
}
