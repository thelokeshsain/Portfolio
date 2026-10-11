// Distributed Atomic Rate Limiter backed by MongoDB TTL collection
// Privacy-preserving: Hashes client IP addresses before storage.

import crypto from "crypto";
import connectDB from "@/lib/db";
import AiRateLimit from "@/models/AiRateLimit";
import { AI_CONFIG } from "./config.js";

if (typeof window !== "undefined") {
  throw new Error("Server-only module src/lib/ai/rateLimiter.js cannot be executed in the browser");
}

const SALT = process.env.RATE_LIMIT_SALT || "lokesh_portfolio_ai_salt_2026";

/**
 * Extracts client IP from trusted reverse proxy headers on Vercel and produces a privacy-preserving SHA-256 hash.
 */
export function getClientIpHash(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  let rawIp = "127.0.0.1";

  if (forwarded) {
    rawIp = forwarded.split(",")[0].trim();
  } else if (realIp) {
    rawIp = realIp.trim();
  }

  return crypto
    .createHash("sha256")
    .update(`${rawIp}:${SALT}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Atomically checks and increments a rate limit bucket in MongoDB.
 * Returns { allowed, remaining, resetSeconds, retryAfter }
 */
export async function checkRateLimit({ key, limit, windowSeconds }) {
  try {
    await connectDB();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

    // Atomically find or create the record and increment count
    const record = await AiRateLimit.findOneAndUpdate(
      { key },
      {
        $inc: { count: 1 },
        $setOnInsert: { createdAt: now, expiresAt },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const currentCount = record.count;
    const remainingMs = Math.max(0, new Date(record.expiresAt).getTime() - now.getTime());
    const resetSeconds = Math.ceil(remainingMs / 1000);

    if (currentCount > limit) {
      return {
        allowed: false,
        remaining: 0,
        resetSeconds,
        retryAfter: resetSeconds,
        limit,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, limit - currentCount),
      resetSeconds,
      retryAfter: 0,
      limit,
    };
  } catch (err) {
    console.error("Rate limiter DB error:", err.message);
    // If DB is temporarily degraded, fail securely with a conservative fallback
    return {
      allowed: true,
      remaining: 1,
      resetSeconds: windowSeconds,
      retryAfter: 0,
      limit,
    };
  }
}

/**
 * Performs dual-window rate limit checks for public chat:
 * 1. Sustained window (e.g. 10 requests / 10 min)
 * 2. Burst window (e.g. 3 requests / 30 sec)
 */
export async function checkChatRateLimit(request) {
  const ipHash = getClientIpHash(request);

  // 1. Check Burst Limit (3 requests per 30s)
  const burstKey = `chat:burst:${ipHash}`;
  const burstRes = await checkRateLimit({
    key: burstKey,
    limit: AI_CONFIG.RATE_LIMIT.CHAT_BURST_MAX,
    windowSeconds: AI_CONFIG.RATE_LIMIT.CHAT_BURST_WINDOW_SECONDS,
  });

  if (!burstRes.allowed) {
    return {
      allowed: false,
      reason: "BURST_LIMIT_EXCEEDED",
      message: "Too many rapid requests. Please wait a moment before sending another question.",
      retryAfter: burstRes.retryAfter,
    };
  }

  // 2. Check Sustained Window Limit (10 requests per 10min)
  const windowKey = `chat:sustained:${ipHash}`;
  const sustainedRes = await checkRateLimit({
    key: windowKey,
    limit: AI_CONFIG.RATE_LIMIT.CHAT_MAX_REQUESTS,
    windowSeconds: AI_CONFIG.RATE_LIMIT.CHAT_WINDOW_SECONDS,
  });

  if (!sustainedRes.allowed) {
    return {
      allowed: false,
      reason: "WINDOW_LIMIT_EXCEEDED",
      message: "Hourly question quota exceeded for this session. Please try again later.",
      retryAfter: sustainedRes.retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: sustainedRes.remaining,
    retryAfter: 0,
  };
}

/**
 * Checks summary generation rate limits per admin / article
 */
export async function checkSummaryRateLimit(articleId) {
  const key = `summary:${articleId}`;
  return checkRateLimit({
    key,
    limit: AI_CONFIG.RATE_LIMIT.SUMMARY_MAX_REQUESTS,
    windowSeconds: AI_CONFIG.RATE_LIMIT.SUMMARY_WINDOW_SECONDS,
  });
}
