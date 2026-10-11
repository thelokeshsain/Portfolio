// Central server-only AI configuration
// Never import this file into Client Components.

if (typeof window !== "undefined") {
  throw new Error("Server-only module src/lib/ai/config.js cannot be executed in the browser");
}

export const AI_CONFIG = {
  // Model Identifiers — Server-controlled, defaulting to active free-tier candidate
  DEFAULT_CHAT_MODEL: process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b",
  DEFAULT_SUMMARY_MODEL: process.env.GROQ_SUMMARY_MODEL || "openai/gpt-oss-20b",

  // Explicit token, character and history boundaries
  MAX_CHAT_INPUT_CHARS: 500,
  MAX_CHAT_HISTORY_MESSAGES: 4, // 2 user + 2 assistant turns
  MAX_CHAT_OUTPUT_TOKENS: 500,
  MAX_SUMMARY_OUTPUT_TOKENS: 600,
  MAX_SUMMARY_INPUT_CHARS: 12000,
  REQUEST_TIMEOUT_MS: 15000,

  // Conservative Free-Tier Rate Limiting (per hashed client IP)
  RATE_LIMIT: {
    CHAT_WINDOW_SECONDS: 600, // 10 minutes
    CHAT_MAX_REQUESTS: 8,
    CHAT_BURST_WINDOW_SECONDS: 30,
    CHAT_BURST_MAX: 2,
    SUMMARY_WINDOW_SECONDS: 600,
    SUMMARY_MAX_REQUESTS: 5,
  },

  // Aliases and convenience getters
  get chatModel() { return this.DEFAULT_CHAT_MODEL; },
  get summaryModel() { return this.DEFAULT_SUMMARY_MODEL; },
  get maxTokens() { return this.MAX_CHAT_OUTPUT_TOKENS; },
  get summaryMaxTokens() { return this.MAX_SUMMARY_OUTPUT_TOKENS; },
  get rateLimit() {
    return {
      chatRequestsPerWindow: this.RATE_LIMIT.CHAT_MAX_REQUESTS,
      burstLimit: this.RATE_LIMIT.CHAT_BURST_MAX,
      summaryRequestsPerWindow: this.RATE_LIMIT.SUMMARY_MAX_REQUESTS,
    };
  },
};

export function getGroqApiKey() {
  return process.env.GROQ_API_KEY || "";
}

export function isGroqConfigured() {
  const key = getGroqApiKey();
  return typeof key === "string" && key.trim().length > 10;
}

export function getChatModel() {
  return AI_CONFIG.DEFAULT_CHAT_MODEL;
}

export function getSummaryModel() {
  return AI_CONFIG.DEFAULT_SUMMARY_MODEL;
}
