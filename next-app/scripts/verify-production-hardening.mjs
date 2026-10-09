import fs from "fs";
import { spawn } from "child_process";

const LOCAL_PORT = 3008;
const LOCAL_BASE = `http://localhost:${LOCAL_PORT}`;
const REMOTE_BASE = "https://lokeshsain.vercel.app";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status) return true;
    } catch {
      await sleep(500);
    }
  }
  return false;
}

async function runVerification() {
  console.log("================================================================");
  console.log(" P0/P1 PRODUCTION HARDENING VERIFICATION & DIAGNOSTICS SUITE");
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = "") {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message} ${details ? `(${details})` : ""}`);
      failed++;
    }
  }

  // Step 1: Start local Next.js production server
  console.log(`Starting local Next.js production server on port ${LOCAL_PORT}...`);
  const serverProcess = spawn("npx", ["next", "start", "-p", String(LOCAL_PORT)], {
    shell: true,
    stdio: "pipe",
    cwd: process.cwd(),
  });

  serverProcess.stderr.on("data", (data) => {
    // console.error(`[Server stderr]: ${data.toString()}`);
  });

  const ready = await waitForServer(`${LOCAL_BASE}/`, 30000);
  if (!ready) {
    console.error("Failed to start local production server within timeout!");
    serverProcess.kill();
    process.exit(1);
  }
  console.log(`Local production server is up and responsive at ${LOCAL_BASE}\n`);

  try {
    // -------------------------------------------------------------
    // SECTION A: ROUTING & STATUS CODES ON LOCAL PRODUCTION BUILD
    // -------------------------------------------------------------
    console.log("--- SECTION A: LOCAL PRODUCTION BUILD TESTS ---");

    // Test A1: Root Homepage
    const resHome = await fetch(`${LOCAL_BASE}/`);
    assert(resHome.status === 200, "A1: Root '/' returns HTTP 200 OK");
    const homeText = await resHome.text();
    assert(homeText.includes("Lokesh Sain"), "A1.1: Root '/' contains portfolio brand name");
    assert(homeText.includes("Perspectives") || homeText.includes("/blog"), "A1.2: Root '/' contains Perspectives navigation link");

    // Test A2: Nonexistent Unknown URL -> Branded 404
    const resUnknown = await fetch(`${LOCAL_BASE}/this-page-should-not-exist-62841`);
    assert(resUnknown.status === 404, "A2: Unknown URL '/this-page-should-not-exist-62841' returns HTTP 404 Not Found");
    const unknownText = await resUnknown.text();
    assert(unknownText.includes("HTTP 404"), "A2.1: 404 response contains 'HTTP 404' badge");
    assert(unknownText.includes("Route Not Located"), "A2.2: 404 response contains 'Route Not Located' tag");
    assert(unknownText.includes("This page could not be found"), "A2.3: 404 response contains human-friendly message");
    assert(unknownText.includes("Back to Home"), "A2.4: 404 response contains primary action 'Back to Home'");
    assert(unknownText.includes("Explore Projects"), "A2.5: 404 response contains secondary action 'Explore Projects'");
    assert(unknownText.includes("Read Perspectives"), "A2.6: 404 response contains secondary action 'Read Perspectives'");
    assert(unknownText.includes("Contact Lokesh"), "A2.7: 404 response contains contact action");

    // Test A3: Perspectives Blog Index
    const resBlog = await fetch(`${LOCAL_BASE}/blog`);
    assert(resBlog.status === 200, "A3: '/blog' returns HTTP 200 OK");
    const blogText = await resBlog.text();
    assert(blogText.includes("Perspectives"), "A3.1: Blog contains Perspectives masthead");
    assert(blogText.includes("infosys-tcs-wipro-green-card-perm-suspension"), "A3.2: Blog lists inaugural article link");

    // Test A4: Nonexistent Blog Article Slug -> Blog-specific 404
    const resBlog404 = await fetch(`${LOCAL_BASE}/blog/slug-that-does-not-exist-xyz`);
    assert(resBlog404.status === 404, "A4: Nonexistent article slug returns HTTP 404 Not Found");
    const blog404Text = await resBlog404.text();
    assert(blog404Text.includes("Perspective Not Found"), "A4.1: Blog 404 renders 'Perspective Not Found' UI");
    assert(blog404Text.includes("Browse All Perspectives"), "A4.2: Blog 404 contains link to browse all perspectives");
    assert(blog404Text.includes("Back to Portfolio"), "A4.3: Blog 404 contains link back to portfolio");

    // Test A5: Published Article Page
    const resArticle = await fetch(`${LOCAL_BASE}/blog/infosys-tcs-wipro-green-card-perm-suspension`);
    assert(resArticle.status === 200, "A5: Published article returns HTTP 200 OK");
    const articleText = await resArticle.text();
    assert(articleText.includes("Infosys, TCS and Wipro Green Card Suspension"), "A5.1: Article renders accurate headline");
    assert(articleText.includes("schema.org"), "A5.2: Article includes structured JSON-LD schema");
    assert(articleText.includes("Sources &amp; Further Reading") || articleText.includes("Sources & Further Reading"), "A5.3: Article includes verified citations section");

    // Test A6: Privacy Policy Page
    const resPrivacy = await fetch(`${LOCAL_BASE}/privacy-policy`);
    assert(resPrivacy.status === 200, "A6: '/privacy-policy' returns HTTP 200 OK");
    const privacyText = await resPrivacy.text();
    assert(privacyText.includes("October 9, 2026"), "A6.1: Privacy Policy contains updated October 9, 2026 date");
    assert(privacyText.includes("Perspectives Editorial Blog &amp; Reader Privacy") || privacyText.includes("Perspectives Editorial Blog & Reader Privacy"), "A6.2: Privacy Policy details Perspectives blog reader privacy");
    assert(privacyText.includes("Hosting Telemetry &amp; Vercel Analytics") || privacyText.includes("Hosting Telemetry & Vercel Analytics"), "A6.3: Privacy Policy documents Vercel hosting & analytics");
    assert(privacyText.includes("ca-pub-6421974191427219"), "A6.4: Privacy Policy documents Google AdSense Publisher ID");
    assert(privacyText.includes("Consent Architecture &amp; Regulatory Choices") || privacyText.includes("Consent Architecture & Regulatory Choices"), "A6.5: Privacy Policy documents TCF v2.2 Consent Architecture");
    assert(privacyText.includes("adminSession"), "A6.6: Privacy Policy documents admin authentication cookies");

    // Test A7: Sitemap & Robots
    const resSitemap = await fetch(`${LOCAL_BASE}/sitemap.xml`);
    assert(resSitemap.status === 200, "A7: '/sitemap.xml' returns HTTP 200 OK");
    const sitemapText = await resSitemap.text();
    assert(sitemapText.includes("/blog"), "A7.1: Sitemap includes '/blog'");
    assert(sitemapText.includes("/blog/infosys-tcs-wipro-green-card-perm-suspension"), "A7.2: Sitemap includes published article");
    assert(!sitemapText.includes("this-page-should-not-exist"), "A7.3: Sitemap does NOT include 404 URLs");

    const resRobots = await fetch(`${LOCAL_BASE}/robots.txt`);
    assert(resRobots.status === 200, "A8: '/robots.txt' returns HTTP 200 OK");
    const robotsText = await resRobots.text();
    assert(robotsText.includes("Disallow: /admin"), "A8.1: Robots disallows '/admin'");
    assert(robotsText.includes("sitemap.xml"), "A8.2: Robots references sitemap");

    // Test A9: Security Headers & Production CSP
    const cspHeader = resHome.headers.get("content-security-policy") || "";
    assert(!cspHeader.includes("'unsafe-eval'"), "A9: Production CSP does NOT include 'unsafe-eval'");

    // Test A10: Protected Endpoints & Previews
    // Unauthenticated request to non-published draft or invalid ID must call notFound() (404) or reject
    const resPreviewNoAuth = await fetch(`${LOCAL_BASE}/blog/preview/507f1f77bcf86cd799439011`);
    assert(resPreviewNoAuth.status === 404 || resPreviewNoAuth.status === 401, "A10.1: Unauthenticated draft preview correctly rejects or returns 404");

    const resAdminNoAuth = await fetch(`${LOCAL_BASE}/api/admin/blog`);
    assert(resAdminNoAuth.status === 401, "A10.2: Unauthenticated /api/admin/blog returns 401 Unauthorized");

    // -------------------------------------------------------------
    // SECTION B: ERROR BOUNDARIES STATIC CODE & CONTRACT CHECKS
    // -------------------------------------------------------------
    console.log("\n--- SECTION B: ERROR BOUNDARIES CHECKS ---");
    const rootErrorContent = fs.readFileSync("src/app/error.jsx", "utf8");
    assert(rootErrorContent.includes('"use client"'), "B1.1: src/app/error.jsx is a client component");
    assert(rootErrorContent.includes("reset"), "B1.2: src/app/error.jsx handles reset function");
    assert(!rootErrorContent.includes("process.env.MONGODB_URI"), "B1.3: src/app/error.jsx does not leak MongoDB URI");

    const globalErrorContent = fs.readFileSync("src/app/global-error.jsx", "utf8");
    assert(globalErrorContent.includes('"use client"'), "B2.1: src/app/global-error.jsx is a client component");
    assert(globalErrorContent.includes("<html") && globalErrorContent.includes("<body"), "B2.2: src/app/global-error.jsx provides html and body tags");
    assert(globalErrorContent.includes("reset"), "B2.3: src/app/global-error.jsx handles reset function");

    const blogErrorContent = fs.readFileSync("src/app/blog/error.jsx", "utf8");
    assert(blogErrorContent.includes('"use client"'), "B3.1: src/app/blog/error.jsx is a client component");
    assert(blogErrorContent.includes("reset"), "B3.2: src/app/blog/error.jsx handles reset function");

    // -------------------------------------------------------------
    // SECTION C: REMOTE VERCEL LIVE DIAGNOSTICS & STATUS
    // -------------------------------------------------------------
    console.log("\n--- SECTION C: REMOTE VERCEL LIVE DIAGNOSTICS ---");
    console.log(`Querying live production domain: ${REMOTE_BASE} ...\n`);

    const remoteEndpoints = [
      "/",
      "/blog",
      "/blog/infosys-tcs-wipro-green-card-perm-suspension",
      "/privacy-policy",
      "/sitemap.xml",
      "/robots.txt",
      "/this-page-should-not-exist-62841",
    ];

    for (const ep of remoteEndpoints) {
      try {
        const url = `${REMOTE_BASE}${ep}`;
        const res = await fetch(url, { redirect: "manual" });
        const text = await res.text();
        const serverHeader = res.headers.get("server") || "N/A";
        const vercelId = res.headers.get("x-vercel-id") || "N/A";
        const contentType = res.headers.get("content-type") || "N/A";
        const isNextDefault404 = text.includes("404: This page could not be found");

        console.log(`[REMOTE] ${ep.padEnd(52)} -> HTTP ${res.status} | Content-Type: ${contentType.split(";")[0]} | Vercel-ID: ${vercelId.slice(0, 18)}... | Next404Default: ${isNextDefault404}`);
      } catch (err) {
        console.error(`[REMOTE ERROR] ${ep}: ${err.message}`);
      }
    }

  } finally {
    // Terminate local server process
    console.log("\nStopping local Next.js test server...");
    serverProcess.kill();
  }

  console.log("\n================================================================");
  console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runVerification();
