import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import cache from "@/utils/responseCache";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const cacheKey = "hero-authoritative-image";
    let cached = cache.get(cacheKey);

    if (!cached) {
      await connectDB();
      const doc = await Portfolio.findOne({}, { "hero.image": 1 }).lean();
      const imageVal = doc?.hero?.image;

      if (!imageVal) {
        // Fallback to static hero laptop mockup
        return NextResponse.redirect(new URL("/images/hero_laptop_mockup.webp", request.url), { status: 307 });
      }

      if (typeof imageVal === "string" && imageVal.startsWith("data:")) {
        const match = imageVal.match(/^data:([^;]+);base64,(.+)$/s);
        if (!match) {
          return NextResponse.redirect(new URL("/images/hero_laptop_mockup.webp", request.url), { status: 307 });
        }

        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");
        const etag = `"${crypto.createHash("md5").update(buffer).digest("hex")}"`;

        cached = {
          buffer,
          mimeType,
          etag,
          length: buffer.length,
        };

        // Cache in memory for 10 minutes
        cache.set(cacheKey, cached, 600);
      } else if (
        typeof imageVal === "string" &&
        (imageVal.startsWith("http://") || imageVal.startsWith("https://") || imageVal.startsWith("/"))
      ) {
        return NextResponse.redirect(new URL(imageVal, request.url), { status: 307 });
      } else {
        return NextResponse.redirect(new URL("/images/hero_laptop_mockup.webp", request.url), { status: 307 });
      }
    }

    // Conditional GET (HTTP 304 Not Modified)
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === cached.etag) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: cached.etag,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new Response(cached.buffer, {
      status: 200,
      headers: {
        "Content-Type": cached.mimeType,
        "Content-Length": cached.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: cached.etag,
      },
    });
  } catch (err) {
    console.error("[HeroImageAPI]", err.message);
    return NextResponse.redirect(new URL("/images/hero_laptop_mockup.webp", request.url), { status: 307 });
  }
}
