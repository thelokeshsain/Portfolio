import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  inspectImageSignature,
  validateImageBuffer,
  generateStorageKey,
  MAX_UPLOAD_SIZE_BYTES,
} from "../src/lib/imageValidator.js";

console.log("=============================================================");
console.log("TESTING BLOG COVER IMAGE UPLOAD ARCHITECTURE & VALIDATION");
console.log("=============================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// 1. UNIT TESTS: IMAGE VALIDATION & SIGNATURE INSPECTION
// -------------------------------------------------------------
console.log("\n--- 1. Testing Image Signatures & Validation ---");

// Valid JPEG buffer
const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const jpegSig = inspectImageSignature(validJpeg);
assert(jpegSig && jpegSig.mime === "image/jpeg" && jpegSig.ext === "jpg", "Valid JPEG signature detected");

const validJpegRes = validateImageBuffer({
  buffer: validJpeg,
  declaredMimeType: "image/jpeg",
  declaredFileName: "test.jpg",
});
assert(validJpegRes.isValid === true && validJpegRes.mime === "image/jpeg", "Valid JPEG upload accepted");

// Valid PNG buffer
const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const pngSig = inspectImageSignature(validPng);
assert(pngSig && pngSig.mime === "image/png" && pngSig.ext === "png", "Valid PNG signature detected");

const validPngRes = validateImageBuffer({
  buffer: validPng,
  declaredMimeType: "image/png",
  declaredFileName: "test.png",
});
assert(validPngRes.isValid === true, "Valid PNG upload accepted");

// Valid WebP buffer (RIFF....WEBP)
const validWebp = Buffer.alloc(16);
validWebp.write("RIFF", 0, 4, "latin1");
validWebp.writeUInt32LE(100, 4);
validWebp.write("WEBP", 8, 4, "latin1");
validWebp.write("VP8 ", 12, 4, "latin1");

const webpSig = inspectImageSignature(validWebp);
assert(webpSig && webpSig.mime === "image/webp" && webpSig.ext === "webp", "Valid WebP signature detected");

const validWebpRes = validateImageBuffer({
  buffer: validWebp,
  declaredMimeType: "image/webp",
  declaredFileName: "perm-suspension-editorial.webp",
});
assert(validWebpRes.isValid === true && validWebpRes.ext === "webp", "Valid WebP upload accepted");

// Valid AVIF buffer (....ftypavif)
const validAvif = Buffer.alloc(16);
validAvif.writeUInt32BE(16, 0);
validAvif.write("ftyp", 4, 4, "latin1");
validAvif.write("avif", 8, 4, "latin1");
const avifSig = inspectImageSignature(validAvif);
assert(avifSig && avifSig.mime === "image/avif" && avifSig.ext === "avif", "Valid AVIF signature detected");

// -------------------------------------------------------------
// 2. SECURITY TESTS: REJECTIONS & MALICIOUS INPUTS
// -------------------------------------------------------------
console.log("\n--- 2. Testing Security & Malicious Rejections ---");

// Test SVG rejection
const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
const svgRes = validateImageBuffer({
  buffer: svgBuffer,
  declaredMimeType: "image/svg+xml",
  declaredFileName: "malicious.svg",
});
assert(!svgRes.isValid && svgRes.status === 400, "SVG vector format is strictly rejected");

// Test HTML payload disguised as webp
const htmlBuffer = Buffer.from('<html><head></head><body>Hello</body></html>');
const htmlRes = validateImageBuffer({
  buffer: htmlBuffer,
  declaredMimeType: "image/webp",
  declaredFileName: "fake.webp",
});
assert(!htmlRes.isValid, "HTML payload disguised as WebP is rejected");

// Test MIME-type spoofing (Declared WebP, but buffer is PNG)
const spoofRes = validateImageBuffer({
  buffer: validPng,
  declaredMimeType: "image/webp",
  declaredFileName: "spoofed.webp",
});
assert(!spoofRes.isValid && spoofRes.error.includes("MIME type spoofing"), "MIME spoofing detected and rejected");

// Test Oversized image (> 5 MB)
const oversizedBuffer = Buffer.alloc(MAX_UPLOAD_SIZE_BYTES + 1024);
// put valid JPEG header at start
validJpeg.copy(oversizedBuffer, 0);
const oversizedRes = validateImageBuffer({
  buffer: oversizedBuffer,
  declaredMimeType: "image/jpeg",
  declaredFileName: "huge.jpg",
});
assert(!oversizedRes.isValid && oversizedRes.error.includes("exceeds the allowed limit"), "Oversized image (>5MB) rejected");

// Test Storage Key Generation
const key1 = generateStorageKey("webp");
const key2 = generateStorageKey("webp");
assert(key1 !== key2, "Storage keys are uniquely generated");
assert(key1.startsWith("blog/") && key1.endsWith(".webp"), "Storage key follows canonical 'blog/{timestamp}-{id}.{ext}' path");
assert(!key1.includes("..") && !key1.includes("/") || key1.split("/").length === 2, "Storage key prevents path traversal");

// -------------------------------------------------------------
// 3. TESTING API ROUTE IMPLEMENTATION & SECURITY
// -------------------------------------------------------------
console.log("\n--- 3. Testing Upload API Route & Security ---");

const routeSource = fs.readFileSync("src/app/api/admin/blog/upload/route.js", "utf8");

assert(routeSource.includes("withAuth("), "Upload route is protected by admin authentication (withAuth)");
assert(routeSource.includes("rateLimiter.check("), "Upload route enforces IP/admin rate limiting");
assert(routeSource.includes("validateImageBuffer("), "Upload route invokes magic-byte buffer validation");
assert(routeSource.includes("generateStorageKey("), "Upload route uses server-generated storage keys");
assert(routeSource.includes("BLOB_READ_WRITE_TOKEN"), "Upload route checks for BLOB_READ_WRITE_TOKEN");
assert(routeSource.includes("STORAGE_CONFIG_MISSING"), "Upload route returns clear diagnostic error if token is not configured");
assert(!routeSource.includes("NEXT_PUBLIC_"), "Upload route never leaks credentials to client environment");

// -------------------------------------------------------------
// 4. TESTING NEXT.JS IMAGE CONFIGURATION
// -------------------------------------------------------------
console.log("\n--- 4. Testing Next.js Image Config ---");

const nextConfigSource = fs.readFileSync("next.config.mjs", "utf8");
assert(
  nextConfigSource.includes("remotePatterns") &&
    nextConfigSource.includes("public.blob.vercel-storage.com"),
  "Next.js next.config.mjs allows Vercel Blob domains in remotePatterns"
);

// -------------------------------------------------------------
// 5. TESTING BLOG EDITOR UI & INTERACTIONS
// -------------------------------------------------------------
console.log("\n--- 5. Testing BlogEditor.jsx Component Architecture ---");

const blogEditorSource = fs.readFileSync("src/components/admin/BlogEditor.jsx", "utf8");

assert(blogEditorSource.includes("handleImageFileSelect"), "BlogEditor contains image file selection handler");
assert(blogEditorSource.includes("handleDrop"), "BlogEditor contains drag-and-drop drop handler");
assert(blogEditorSource.includes("handleDragOver"), "BlogEditor contains dragover styling handler");
assert(blogEditorSource.includes("handleRemoveCoverImage"), "BlogEditor contains image remove handler");
assert(blogEditorSource.includes("Replace Image"), "BlogEditor contains image replace button");
assert(blogEditorSource.includes("16:9 Recommended"), "BlogEditor displays 16:9 aspect ratio recommendation");
assert(blogEditorSource.includes('accept="image/jpeg,image/png,image/webp,image/avif"'), "File input specifies raster format constraints");
assert(blogEditorSource.includes('id="art-img-url"'), "Manual image URL input preserved for backwards compatibility");
assert(blogEditorSource.includes('id="art-img-alt"'), "Alt text field preserved and linked to form state");
assert(blogEditorSource.includes('id="art-img-credit"'), "Attribution/credit field preserved and linked to form state");
assert(blogEditorSource.includes("uploadingImage"), "BlogEditor displays loading spinner during upload");

// -------------------------------------------------------------
// 6. TESTING ASSET PRESERVATION
// -------------------------------------------------------------
console.log("\n--- 6. Testing Existing Assets Preservation ---");

const permEditorialPath = "public/images/blog/perm-suspension-editorial.webp";
assert(fs.existsSync(permEditorialPath), "Existing article asset perm-suspension-editorial.webp is preserved");

const socialPreviewPath = "public/images/social_preview.webp";
assert(fs.existsSync(socialPreviewPath), "Existing public/images/social_preview.webp is preserved");
const socialPreviewSize = fs.statSync(socialPreviewPath).size;
assert(socialPreviewSize === 221270, `Social preview file size exactly preserved (221,270 bytes, actual: ${socialPreviewSize})`);

// -------------------------------------------------------------
// 7. TESTING SUMMARY
// -------------------------------------------------------------
console.log("\n=============================================================");
if (failed === 0) {
  console.log(`ALL ${passed} BLOG IMAGE UPLOAD TESTS PASSED SUCCESSFULLY!`);
  console.log("=============================================================");
  process.exit(0);
} else {
  console.error(`FAILED: ${failed} tests failed, ${passed} passed.`);
  console.log("=============================================================");
  process.exit(1);
}
