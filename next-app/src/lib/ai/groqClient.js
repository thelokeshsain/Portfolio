// Server-only Groq API Client wrapper
// Communicates directly with Groq Cloud API over secure HTTPS from Vercel Serverless Functions.

import Groq from "groq-sdk";
import { AI_CONFIG, getGroqApiKey, isGroqConfigured } from "./config.js";

if (typeof window !== "undefined") {
  throw new Error("Server-only module src/lib/ai/groqClient.js cannot be executed in the browser");
}

let groqInstance = null;

function getClient() {
  if (!isGroqConfigured()) {
    return null;
  }
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: getGroqApiKey(),
      timeout: AI_CONFIG.REQUEST_TIMEOUT_MS,
    });
  }
  return groqInstance;
}

/**
 * Execute a bounded, timeout-protected chat completion with Groq.
 * Uses max_completion_tokens (with fallback to max_tokens if required by provider).
 */
export async function executeGroqCompletion({
  messages,
  model,
  maxCompletionTokens = AI_CONFIG.MAX_CHAT_OUTPUT_TOKENS,
  temperature = 0.3,
}) {
  if (!isGroqConfigured()) {
    return {
      success: false,
      error: "AI_SERVICE_UNAVAILABLE",
      message: "Groq AI service is currently not configured in this environment.",
      statusCode: 503,
    };
  }

  const client = getClient();
  if (!client) {
    return {
      success: false,
      error: "AI_INIT_FAILED",
      message: "Failed to initialize Groq client.",
      statusCode: 500,
    };
  }

  const targetModel = model || AI_CONFIG.DEFAULT_CHAT_MODEL;
  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: targetModel,
      messages,
      max_completion_tokens: maxCompletionTokens,
      temperature,
    });

    const latency = Date.now() - startTime;
    const choice = response.choices?.[0];
    const content = choice?.message?.content || "";
    const finishReason = choice?.finish_reason || "stop";

    const usage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      latencyMs: latency,
    };

    return {
      success: true,
      content,
      finishReason,
      model: response.model || targetModel,
      usage,
    };
  } catch (err) {
    const latency = Date.now() - startTime;
    const status = err.status || err.statusCode || 500;
    const errorType = err.type || err.code || "UPSTREAM_ERROR";

    // Safe sanitized error mapping — never leak raw internal trace or secrets
    let safeMessage = "An unexpected error occurred while communicating with the AI service.";
    let safeCode = "AI_UPSTREAM_ERROR";

    if (status === 429) {
      safeCode = "AI_UPSTREAM_RATE_LIMIT";
      safeMessage = "Upstream AI provider rate limit reached. Please retry in a few moments.";
    } else if (err.name === "AbortError" || err.message?.includes("timeout") || latency >= AI_CONFIG.REQUEST_TIMEOUT_MS) {
      safeCode = "AI_TIMEOUT";
      safeMessage = "The AI service took too long to respond. Request timed out.";
    } else if (status >= 500) {
      safeCode = "AI_UPSTREAM_UNAVAILABLE";
      safeMessage = "The AI provider is temporarily unavailable. Please try again later.";
    }

    return {
      success: false,
      error: safeCode,
      message: safeMessage,
      statusCode: status === 429 ? 429 : 503,
      latencyMs: latency,
    };
  }
}
