// Public AI Chat Route Handler — "Ask Lokesh AI"
// Bounded, rate-limited, grounded in public portfolio facts and published articles.

import { NextResponse } from "next/server";
import { checkChatRateLimit } from "@/lib/ai/rateLimiter";
import { buildGroundedContext } from "@/lib/ai/knowledgeBase";
import {
  validateUserMessage,
  validateHistory,
  detectSuspiciousPatterns,
  buildSystemPrompt,
  sanitizeModelOutput,
} from "@/lib/ai/safety";
import { executeGroqCompletion } from "@/lib/ai/groqClient";
import { isGroqConfigured, getChatModel } from "@/lib/ai/config";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // 1. Enforce Content-Type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "INVALID_CONTENT_TYPE", message: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    // 2. Enforce atomic rate limit before parsing or retrieval
    const rateLimit = await checkChatRateLimit(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: rateLimit.message,
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
            "Cache-Control": "private, no-store, max-age=0",
          },
        }
      );
    }

    // 3. Parse and bound request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "INVALID_JSON", message: "Malformed JSON payload" },
        { status: 400 }
      );
    }

    const { message, history } = body || {};

    // 4. Validate user input
    const validation = validateUserMessage(message);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, message: validation.message },
        { status: 400 }
      );
    }

    const cleanMessage = validation.sanitizedMessage;
    const cleanHistory = validateHistory(history);

    // 5. Prompt injection early detection
    if (detectSuspiciousPatterns(cleanMessage)) {
      return NextResponse.json(
        {
          answer:
            "I'm here to answer questions specifically about Lokesh Sain's software engineering background, technical skills, projects, and published articles on Perspectives. How can I help you explore his work?",
          sources: [
            { title: "Portfolio Homepage", url: "https://lokeshsain.vercel.app/" },
            { title: "Perspectives Blog", url: "https://lokeshsain.vercel.app/blog" },
          ],
          model: "system-safety-guard",
        },
        {
          status: 200,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    // 6. Check if Groq is configured
    if (!isGroqConfigured()) {
      return NextResponse.json(
        {
          error: "AI_NOT_CONFIGURED",
          message:
            "Ask Lokesh AI is temporarily in maintenance mode while server credentials are being updated. You can view Lokesh's full engineering background and contact info directly on the portfolio.",
          available: false,
          fallbackAnswer:
            "Lokesh Sain is a Software Engineer based in Jaipur, India, specializing in modern web architecture, React.js, Node.js, and the MERN stack. Feel free to explore his projects below or connect via LinkedIn!",
          sources: [
            { title: "Portfolio", url: "https://lokeshsain.vercel.app/" },
            { title: "Perspectives Blog", url: "https://lokeshsain.vercel.app/blog" },
            { title: "LinkedIn", url: "https://www.linkedin.com/in/lokeshsain" },
          ],
        },
        {
          status: 503,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    // 7. Grounded context retrieval
    const { contextText, approvedSources } = await buildGroundedContext(cleanMessage);

    // 8. Build message payload for Groq
    const systemPrompt = buildSystemPrompt(contextText);
    const messages = [
      { role: "system", content: systemPrompt },
      ...cleanHistory,
      { role: "user", content: cleanMessage },
    ];

    // 9. Execute completion
    const targetModel = getChatModel();
    const result = await executeGroqCompletion({
      messages,
      model: targetModel,
      temperature: 0.3,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          message: result.message,
        },
        {
          status: result.statusCode,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

    const sanitizedAnswer = sanitizeModelOutput(result.content);

    return NextResponse.json(
      {
        answer: sanitizedAnswer,
        sources: approvedSources,
        model: result.model,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (err) {
    console.error("AI chat route error:", err.message);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "An unexpected error occurred. Please try again." },
      { status: 500, headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  }
}
