import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { withAuth } from "@/lib/auth";
import rateLimiter from "@/utils/rateLimiter";
import {
  validateImageBuffer,
  generateStorageKey,
} from "@/lib/imageValidator";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/blog/upload
 * Secure, authenticated endpoint for uploading blog cover images to Vercel Blob.
 * Enforces admin authorization, rate limiting, magic-byte inspection, size limits,
 * and canonical random storage path generation.
 */
export const POST = withAuth(async (request) => {
  try {
    // 1. Rate limiting check (20 uploads / minute per admin)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";
    const adminIdentifier = request.admin?._id
      ? String(request.admin._id)
      : ip;
    const rateCheck = rateLimiter.check(`admin-upload:${adminIdentifier}`, 20, 60 * 1000);

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMITED",
          message: `Too many upload requests. Please wait ${rateCheck.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfter),
          },
        }
      );
    }

    // 2. Parse multipart form data
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_FORM_DATA",
          message: "Failed to parse multipart form data.",
        },
        { status: 400 }
      );
    }

    const file = formData.get("file") || formData.get("image");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_FILE",
          message: "No image file provided in form data under 'file' or 'image'.",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Server-side validation (Size, Magic bytes, Extension, MIME spoofing)
    const validation = validateImageBuffer({
      buffer,
      declaredMimeType: file.type || "",
      declaredFileName: file.name || "",
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_FAILED",
          message: validation.error,
        },
        { status: validation.status }
      );
    }

    // 4. Check for storage configuration (Vercel Blob token)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        {
          success: false,
          error: "STORAGE_CONFIG_MISSING",
          message:
            "Persistent storage is not configured. BLOB_READ_WRITE_TOKEN environment variable is missing. Please configure Vercel Blob in your project settings.",
        },
        { status: 503 }
      );
    }

    // 5. Generate safe unique storage key and upload to Vercel Blob
    const storagePath = generateStorageKey(validation.ext);

    const blob = await put(storagePath, buffer, {
      access: "public",
      contentType: validation.mime,
      token: blobToken,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || validation.mime,
      size: validation.size,
      message: "Image successfully uploaded to persistent storage.",
    });
  } catch (error) {
    // Avoid logging sensitive tokens or headers
    console.error("POST /api/admin/blog/upload failure:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "UPLOAD_FAILED",
        message:
          error.message ||
          "An unexpected error occurred while uploading the image.",
      },
      { status: 500 }
    );
  }
});
