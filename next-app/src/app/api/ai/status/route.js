// Public Health & Status Route for AI Services
// Returns service availability status without leaking keys or internal credentials.

import { NextResponse } from "next/server";
import { isGroqConfigured, getChatModel } from "@/lib/ai/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isGroqConfigured();

  return NextResponse.json(
    {
      configured,
      model: configured ? getChatModel() : null,
      service: "Groq Cloud High-Speed Inference",
      status: configured ? "operational" : "maintenance",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
