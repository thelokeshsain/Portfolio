import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import cache from "@/utils/responseCache";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const rawId = params?.id;

    if (!rawId) {
      return new Response("Project ID required", { status: 400 });
    }

    // Check memory cache first for sub-millisecond response
    const cacheKey = `project-image-${rawId}`;
    let cached = cache.get(cacheKey);

    if (!cached) {
      await connectDB();
      const numId = Number(rawId);
      const query = !isNaN(numId)
        ? { $or: [{ "projects.id": numId }, { "projects.id": String(rawId) }] }
        : { "projects.id": String(rawId) };

      const doc = await Portfolio.findOne(query, { "projects.$": 1 }).lean();
      const project = doc?.projects?.[0];

      if (!project || !project.image) {
        return new Response("Project image not found", { status: 404 });
      }

      const imageVal = project.image;

      if (typeof imageVal === "string" && imageVal.startsWith("data:")) {
        const match = imageVal.match(/^data:([^;]+);base64,(.+)$/s);
        if (!match) {
          return new Response("Invalid image data URI", { status: 422 });
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
      } else if (typeof imageVal === "string" && (imageVal.startsWith("http://") || imageVal.startsWith("https://") || imageVal.startsWith("/"))) {
        return NextResponse.redirect(new URL(imageVal, request.url), { status: 307 });
      } else {
        return new Response("Unsupported image format", { status: 404 });
      }
    }

    // Conditional GET (HTTP 304 Not Modified)
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === cached.etag) {
      return new Response(null, {
        status: 304,
        headers: {
          "ETag": cached.etag,
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
        "ETag": cached.etag,
      },
    });
  } catch (err) {
    console.error("[ProjectImageAPI]", err.message);
    return new Response("Failed to load project image", { status: 500 });
  }
}
