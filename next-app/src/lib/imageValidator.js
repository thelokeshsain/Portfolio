import crypto from "crypto";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

// Normalization map for alternate or vendor-prefixed MIME headers
const MIME_ALIASES = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

/**
 * Inspect magic bytes / file signatures to verify raster image format.
 * Returns { mime, ext } if valid raster format, or null if unknown / active-content / unsupported.
 */
export function inspectImageSignature(buffer) {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // JPEG: 0xFF, 0xD8, 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  // PNG: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }

  // WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  const riff = buffer.toString("latin1", 0, 4);
  const webp = buffer.toString("latin1", 8, 12);
  if (riff === "RIFF" && webp === "WEBP") {
    return { mime: "image/webp", ext: "webp" };
  }

  // AVIF: ISO Base Media File Format box (ftyp at offset 4)
  const ftyp = buffer.toString("latin1", 4, 8);
  if (ftyp === "ftyp") {
    const brand = buffer.toString("latin1", 8, 12);
    if (["avif", "avis", "mif1", "msf1"].includes(brand)) {
      return { mime: "image/avif", ext: "avif" };
    }
  }

  return null;
}

/**
 * Validates image upload buffer against size, signature, and declared metadata.
 * Explicitly rejects SVG, HTML, scripts, oversized payloads, and MIME spoofing.
 */
export function validateImageBuffer({
  buffer,
  declaredMimeType = "",
  declaredFileName = "",
  maxSizeBytes = MAX_UPLOAD_SIZE_BYTES,
}) {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, status: 400, error: "Empty file: no image data received" };
  }

  if (buffer.length > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      status: 400,
      error: `File size exceeds the allowed limit of ${maxMb}MB`,
    };
  }

  // Quick check for active content (SVG, HTML, XML, scripts)
  const sampleText = buffer.slice(0, 256).toString("utf8").toLowerCase();
  if (
    sampleText.includes("<svg") ||
    sampleText.includes("<?xml") ||
    sampleText.includes("<html") ||
    sampleText.includes("<script")
  ) {
    return {
      isValid: false,
      status: 400,
      error: "SVG and scriptable vector formats are not allowed for security reasons. Please upload JPEG, PNG, WebP, or AVIF.",
    };
  }

  const detected = inspectImageSignature(buffer);
  if (!detected) {
    return {
      isValid: false,
      status: 400,
      error: "Unsupported or corrupt image format. Only raster images (JPEG, PNG, WebP, AVIF) are supported.",
    };
  }

  // Normalize declared MIME type
  let normalizedDeclared = (declaredMimeType || "").trim().toLowerCase();
  if (MIME_ALIASES[normalizedDeclared]) {
    normalizedDeclared = MIME_ALIASES[normalizedDeclared];
  }

  if (normalizedDeclared) {
    if (!SUPPORTED_MIME_TYPES.has(normalizedDeclared)) {
      return {
        isValid: false,
        status: 400,
        error: `Declared MIME type '${declaredMimeType}' is not supported.`,
      };
    }

    if (normalizedDeclared !== detected.mime) {
      return {
        isValid: false,
        status: 400,
        error: `MIME type spoofing detected: declared '${declaredMimeType}' does not match actual file signature '${detected.mime}'.`,
      };
    }
  }

  // Validate filename extension if present
  if (declaredFileName && typeof declaredFileName === "string") {
    const extMatch = declaredFileName.toLowerCase().match(/\.([a-z0-9]+)$/);
    if (extMatch) {
      const ext = extMatch[1];
      if (ext === "svg" || ext === "html" || ext === "htm" || ext === "js" || ext === "php") {
        return {
          isValid: false,
          status: 400,
          error: `Potentially unsafe file extension '.${ext}' is rejected.`,
        };
      }
    }
  }

  return {
    isValid: true,
    mime: detected.mime,
    ext: detected.ext,
    size: buffer.length,
  };
}

/**
 * Generates an unguessable, secure storage key.
 * Never incorporates untrusted user input directly.
 */
export function generateStorageKey(extension) {
  const safeExt = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "webp";
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  return `blog/${timestamp}-${uniqueId}.${safeExt}`;
}
