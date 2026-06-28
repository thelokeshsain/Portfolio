import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import toPublicPortfolio from "@/utils/publicPortfolio";
import cache from "@/utils/responseCache";
import { PORTFOLIO } from "@/lib/data";

const PUBLIC_CACHE_CONTROL =
  "public, max-age=120, s-maxage=300, stale-while-revalidate=60";

export async function GET(request) {
  try {
    await connectDB();
    let portfolio = cache.get("portfolio");

    if (!portfolio) {
      const portfolioDoc = await Portfolio.findOne({})
        .select("-__v")
        .maxTimeMS(3000)
        .lean();

      if (!portfolioDoc) {
        return NextResponse.json(
          { message: "Portfolio not found." },
          { status: 404 }
        );
      }

      portfolio = toPublicPortfolio(portfolioDoc);
      cache.set("portfolio", portfolio, 300);
    }

    const response = NextResponse.json(portfolio);
    response.headers.set("Cache-Control", PUBLIC_CACHE_CONTROL);
    return response;
  } catch (err) {
    console.error("[Portfolio]", err.message);
    // Return defaultData so client doesn't get a 500 error in console
    const response = NextResponse.json(PORTFOLIO);
    response.headers.set("Cache-Control", PUBLIC_CACHE_CONTROL);
    return response;
  }
}
