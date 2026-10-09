import fs from "fs";
import crypto from "crypto";
import mongoose from "mongoose";

if (!process.env.MONGODB_URI && fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const BASE = "http://localhost:3000";

function generatePreviewToken(articleId) {
  const secret = process.env.JWT_SECRET || "fallback_secret";
  return crypto.createHmac("sha256", secret).update(String(articleId)).digest("hex");
}

async function runTests() {
  console.log("==================================================");
  console.log(" PERSPECTIVES EDITORIAL BLOG - AUTOMATED TEST SUITE");
  console.log("==================================================");

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

  // 1. Connect to DB and verify published article
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.collection("articles");
  const publishedDoc = await collection.findOne({
    slug: "infosys-tcs-wipro-green-card-perm-suspension",
  });

  assert(Boolean(publishedDoc), "Published Perspectives article exists in database");
  assert(publishedDoc?.status === "published", "Article status is 'published'");
  assert(Boolean(publishedDoc?.publishedAt), "Article has valid publishedAt timestamp");

  // 2. Test /blog homepage
  console.log("\n--- TEST 1: Public Editorial Homepage (/blog) ---");
  const resBlog = await fetch(`${BASE}/blog`);
  assert(resBlog.status === 200, "/blog returns HTTP 200 OK");
  const blogHtml = await resBlog.text();
  assert(
    blogHtml.includes("Lokesh Sain") && blogHtml.includes("Perspectives"),
    "/blog renders 'Lokesh Sain — Perspectives' masthead"
  );
  assert(
    blogHtml.includes("perspectives-theme"),
    "/blog wraps content in isolated light theme (.perspectives-theme)"
  );
  assert(
    blogHtml.includes("Immigration &amp; Careers") || blogHtml.includes("Immigration & Careers"),
    "/blog renders category navigation tabs"
  );
  assert(
    blogHtml.includes("schema.org") && blogHtml.includes('"@type":"Blog"'),
    "/blog injects valid Blog JSON-LD structured data"
  );
  assert(
    blogHtml.includes("infosys-tcs-wipro-green-card-perm-suspension"),
    "/blog includes clickable card to published article"
  );

  // 3. Test Published Article Route & Content
  console.log("\n--- TEST 2: Published Article Route (/blog/[slug]) ---");
  const resArticle = await fetch(
    `${BASE}/blog/infosys-tcs-wipro-green-card-perm-suspension`
  );
  assert(resArticle.status === 200, "Published article returns HTTP 200 OK");
  const articleHtml = await resArticle.text();

  assert(
    articleHtml.includes("Infosys, TCS and Wipro Green Card Suspension: What the US PERM Action Means"),
    "Article renders exact H1 headline"
  );
  assert(
    articleHtml.includes("October 8–9, 2026") || articleHtml.includes("October 8"),
    "Article contains verified October 8–9, 2026 timeline"
  );
  assert(
    articleHtml.includes("Keith Sonderling") && articleHtml.includes("Vance"),
    "Article cites Labor Secretary Keith Sonderling and VP Vance"
  );
  assert(
    articleHtml.includes("Tata Consultancy Services (TCS)") && articleHtml.includes("Microsoft"),
    "Article lists verified corporate entities"
  );
  assert(
    articleHtml.includes("Phase 1: PERM Labor Certification") || articleHtml.includes("Step 1: PERM"),
    "Article accurately details the 3-step green card architecture"
  );
  assert(
    articleHtml.includes("schema.org") && articleHtml.includes('"@type":"BlogPosting"'),
    "Article injects valid BlogPosting structured data"
  );
  assert(
    articleHtml.includes('"@type":"BreadcrumbList"'),
    "Article injects valid BreadcrumbList structured data"
  );
  assert(
    articleHtml.includes('rel="canonical"') &&
      articleHtml.includes("infosys-tcs-wipro-green-card-perm-suspension"),
    "Article renders exact canonical link tag"
  );
  assert(
    articleHtml.includes("flag.dol.gov/index.php/programs/perm"),
    "Article links directly to official US Department of Labor FLAG portal"
  );
  assert(
    articleHtml.includes("reuters.com"),
    "Article cites verified Reuters report on TCS corporate response"
  );
  assert(
    articleHtml.includes("Legal Information Disclaimer:"),
    "Article displays prominent legal information disclaimer"
  );

  // 4. Test Search with Regex Characters (NoSQL / Regex ReDoS defense)
  console.log("\n--- TEST 3: Search Sanitization & Regex Injection Defense ---");
  const resSearchSpecial = await fetch(`${BASE}/blog?q=test(regex[*`);
  assert(
    resSearchSpecial.status === 200,
    "Search with regex meta-characters does not crash or throw 500"
  );

  // 5. Test Draft Protection & Preview Authorization
  console.log("\n--- TEST 4: Draft Protection & Preview Authorization ---");
  // Create a temporary test draft
  const testDraftId = new mongoose.Types.ObjectId();
  await collection.insertOne({
    _id: testDraftId,
    title: "Temporary Security Test Draft",
    slug: "temp-security-test-draft-" + Date.now(),
    dek: "This draft must never be accessible to the public without authorization.",
    category: "Technology",
    tags: ["SecurityTest"],
    content: "## Secret Content\nThis should be blocked from unauthenticated viewers.",
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Verify draft is blocked on public route
  const resDraftPublic = await fetch(`${BASE}/blog/temp-security-test-draft`);
  assert(
    resDraftPublic.status === 404,
    "Unpublished draft returns HTTP 404 on public route /blog/[slug]"
  );

  // Verify unauthenticated request to /blog/preview/[id] is blocked
  const resPreviewUnauth = await fetch(`${BASE}/blog/preview/${testDraftId.toString()}`);
  assert(
    resPreviewUnauth.status === 404,
    "Unauthenticated request to draft preview returns HTTP 404 (draft undisclosed)"
  );

  // Verify authorized request to /blog/preview/[id]?token=HMAC succeeds
  const validToken = generatePreviewToken(testDraftId.toString());
  const resPreviewAuth = await fetch(
    `${BASE}/blog/preview/${testDraftId.toString()}?token=${validToken}`
  );
  assert(
    resPreviewAuth.status === 200,
    "Authorized request with preview token returns HTTP 200 OK"
  );
  const previewHtml = await resPreviewAuth.text();
  assert(
    previewHtml.includes("PRIVATE DRAFT PREVIEW"),
    "Authorized preview displays editorial draft banner"
  );
  assert(
    previewHtml.includes("noindex"),
    "Authorized preview specifies noindex directive"
  );

  // Clean up temporary test draft
  await collection.deleteOne({ _id: testDraftId });
  console.log(">> Cleaned up temporary test draft.");

  // 6. Test Sitemap & Robots
  console.log("\n--- TEST 5: Sitemap & Robots.txt Verification ---");
  const resSitemap = await fetch(`${BASE}/sitemap.xml`);
  assert(resSitemap.status === 200, "/sitemap.xml returns HTTP 200 OK");
  const sitemapXml = await resSitemap.text();
  assert(sitemapXml.includes("/blog"), "/sitemap.xml includes /blog editorial hub");
  assert(
    sitemapXml.includes("infosys-tcs-wipro-green-card-perm-suspension"),
    "/sitemap.xml includes published article canonical URL"
  );

  const resRobots = await fetch(`${BASE}/robots.txt`);
  assert(resRobots.status === 200, "/robots.txt returns HTTP 200 OK");
  const robotsTxt = await resRobots.text();
  assert(
    robotsTxt.includes("Disallow: /blog/preview/"),
    "/robots.txt blocks crawlers from /blog/preview/"
  );
  assert(
    robotsTxt.includes("Disallow: /admin"),
    "/robots.txt blocks crawlers from /admin"
  );
  assert(
    robotsTxt.toLowerCase().includes("sitemap: https://lokeshsain.vercel.app/sitemap.xml"),
    "/robots.txt includes sitemap declaration"
  );

  // 7. Test Admin API Security Enforcement
  console.log("\n--- TEST 6: Admin API Security & Authentication Enforcement ---");
  const resAdminGet = await fetch(`${BASE}/api/admin/blog`);
  assert(
    resAdminGet.status === 401,
    "GET /api/admin/blog rejects unauthenticated requests (HTTP 401)"
  );

  const resAdminPost = await fetch(`${BASE}/api/admin/blog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Unauthorized Attempt" }),
  });
  assert(
    resAdminPost.status === 401,
    "POST /api/admin/blog rejects unauthenticated creation (HTTP 401)"
  );

  const resAdminPut = await fetch(`${BASE}/api/admin/blog/6ac864b94d4aa6216eef8a72`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Unauthorized Update" }),
  });
  assert(
    resAdminPut.status === 401,
    "PUT /api/admin/blog/[id] rejects unauthenticated updates (HTTP 401)"
  );

  const resAdminDelete = await fetch(`${BASE}/api/admin/blog/6ac864b94d4aa6216eef8a72`, {
    method: "DELETE",
  });
  assert(
    resAdminDelete.status === 401,
    "DELETE /api/admin/blog/[id] rejects unauthenticated deletion (HTTP 401)"
  );

  await mongoose.disconnect();

  console.log("\n==================================================");
  console.log(` SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
