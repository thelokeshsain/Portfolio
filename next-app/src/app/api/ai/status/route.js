// Public Health & Status Route for AI Services
// Returns service availability and model verification status without leaking keys or internal credentials.

import { NextResponse } from "next/server";
import { isGroqConfigured, getChatModel } from "@/lib/ai/config.js";
import { resolveVerifiedModel } from "@/lib/ai/modelDiscovery.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isGroqConfigured();

  if (!configured) {
    return NextResponse.json(
      {
        configured: false,
        modelVerified: false,
        operational: false,
        status: "not_configured",
        message: "AI services are not configured in this environment.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      }
    );
  }

  const configuredModel = getChatModel();
  const resolution = await resolveVerifiedModel(configuredModel);

  const isOperational = resolution.verified;

  return NextResponse.json(
    {
      configured: true,
      model: resolution.model,
      modelVerified: resolution.verified,
      operational: isOperational,
      status: isOperational ? "operational" : "model_unavailable",
      service: "Groq Cloud High-Speed Inference (Free Tier)",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
