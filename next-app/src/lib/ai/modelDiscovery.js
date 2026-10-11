// Server-only Groq Model Discovery and Dynamic Validation Layer
// Queries GET https://api.groq.com/openai/v1/models to verify active models on the configured plan.

import { getGroqApiKey, isGroqConfigured } from "./config.js";

if (typeof window !== "undefined") {
  throw new Error("Server-only module src/lib/ai/modelDiscovery.js cannot be executed in the browser");
}

let cachedModels = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export function clearModelCache() {
  cachedModels = null;
  cacheExpiry = 0;
}

// Verified active candidates for Free / Developer tiers following August 2026 deprecations
export const FREE_TIER_CANDIDATE_MODELS = [
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "openai/gpt-oss-120b",
];

/**
 * Fetches the active model catalog from Groq API using the configured server-side key.
 * Caches the response to eliminate redundant API calls. Never leaks credentials.
 */
export async function getAvailableGroqModels() {
  if (!isGroqConfigured()) {
    return { success: false, error: "NOT_CONFIGURED", models: [] };
  }

  const now = Date.now();
  if (cachedModels && now < cacheExpiry) {
    return { success: true, models: cachedModels, cached: true };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getGroqApiKey()}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const status = res.status;
      return {
        success: false,
        statusCode: status,
        error: status === 401 ? "INVALID_API_KEY" : "UPSTREAM_MODELS_FETCH_FAILED",
        models: [],
      };
    }

    const json = await res.json();
    const modelIds = Array.isArray(json?.data)
      ? json.data.map((m) => m.id).filter(Boolean)
      : [];

    cachedModels = modelIds;
    cacheExpiry = now + CACHE_TTL_MS;

    return { success: true, models: modelIds, cached: false };
  } catch (err) {
    console.error("Error discovering Groq models:", err.message);
    // If cache exists even if expired, use it as fallback
    if (cachedModels) {
      return { success: true, models: cachedModels, stale: true };
    }
    return {
      success: false,
      error: err.name === "AbortError" ? "TIMEOUT" : "FETCH_ERROR",
      models: [],
    };
  }
}

/**
 * Selects and verifies a suitable chat/summary model from the active account catalog.
 * Resolves to the requested model if active, or falls back safely to a verified free-tier candidate.
 */
export async function resolveVerifiedModel(requestedModel) {
  const discovery = await getAvailableGroqModels();

  if (!discovery.success || !discovery.models || discovery.models.length === 0) {
    const isKnownCandidate = requestedModel && FREE_TIER_CANDIDATE_MODELS.includes(requestedModel);
    return {
      model: isKnownCandidate ? requestedModel : FREE_TIER_CANDIDATE_MODELS[0],
      verified: false,
      fallbackUsed: !isKnownCandidate,
      availableList: [],
    };
  }

  const activeIds = discovery.models;

  // 1. Check if the specifically requested model is active and supported
  if (requestedModel && activeIds.includes(requestedModel)) {
    return {
      model: requestedModel,
      verified: true,
      availableList: activeIds,
    };
  }

  // 2. Check candidate models in order of priority for free tier
  for (const candidate of FREE_TIER_CANDIDATE_MODELS) {
    if (activeIds.includes(candidate)) {
      return {
        model: candidate,
        verified: true,
        fallbackUsed: requestedModel !== candidate,
        availableList: activeIds,
      };
    }
  }

  // 3. If none of the specific candidates match, search for any open chat model
  const chatCapable = activeIds.find(
    (id) =>
      !id.includes("whisper") &&
      !id.includes("guard") &&
      !id.includes("embedding") &&
      !id.includes("tts")
  );

  if (chatCapable) {
    return {
      model: chatCapable,
      verified: true,
      fallbackUsed: true,
      availableList: activeIds,
    };
  }

  return {
    model: requestedModel || FREE_TIER_CANDIDATE_MODELS[0],
    verified: false,
    error: "NO_ACTIVE_CHAT_MODELS",
    availableList: activeIds,
  };
}
