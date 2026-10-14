import fs from "fs";

console.log("=============================================================");
console.log("TESTING LIVE PRODUCTION, ARCHIVAL INTEGRITY & CACHE REGRESSION");
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

async function run() {
  const BASE_URL = "https://lokeshsain.vercel.app";

  // 1. Live Blog Index Check
  console.log("\n--- 1. Live Production Blog Index ---");
  const blogRes = await fetch(`${BASE_URL}/blog`, { cache: "no-store" });
  assert(blogRes.status === 200, `/blog returns HTTP 200 (actual: ${blogRes.status})`);
  const blogHtml = await blogRes.text();
  assert(!blogHtml.includes("Infosys, TCS and Wipro Green Card Suspension"), "/blog does NOT contain archived PERM article");
  assert(blogHtml.includes("All Perspectives"), "/blog navigation contains 'All Perspectives'");
  assert(!blogHtml.includes("category=Geopolitics"), "/blog has NO empty 'Geopolitics' category tab");
  assert(!blogHtml.includes("category=Sports"), "/blog has NO empty 'Sports' category tab");
  assert(blogHtml.includes("Perspectives in Editorial Review"), "/blog displays honest editorial review empty state");

  // 2. Direct Route 404 Check for Archived Article
  console.log("\n--- 2. Archived Article Direct Route Behavior ---");
  const permUrl = `${BASE_URL}/blog/infosys-tcs-wipro-green-card-perm-suspension`;
  const permRes = await fetch(permUrl, { cache: "no-store" });
  assert(permRes.status === 404, `Direct URL returns genuine HTTP 404 (actual: ${permRes.status})`);
  const permHtml = await permRes.text();
  assert(!permHtml.includes("Infosys, TCS and Wipro Green Card Suspension: What the US PERM Action Means"), "Direct 404 response does NOT contain article content");
  assert(permHtml.includes("Article Not Found") || permHtml.includes("404"), "Direct 404 response renders intended not-found UI");

  // 3. Draft Seclusion (No Draft Leakage)
  console.log("\n--- 3. Draft Seclusion (No Unauthenticated Access) ---");
  const draftUrl = `${BASE_URL}/blog/react-error-130-turbopack-postmortem`;
  const draftRes = await fetch(draftUrl, { cache: "no-store" });
  assert(draftRes.status === 404, `Unpublished draft returns HTTP 404 to public crawlers (actual: ${draftRes.status})`);

  // 4. XML Sitemap Verification
  console.log("\n--- 4. Live XML Sitemap Verification ---");
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`, { cache: "no-store" });
  assert(sitemapRes.status === 200, `/sitemap.xml returns HTTP 200 (actual: ${sitemapRes.status})`);
  const sitemapXml = await sitemapRes.text();
  assert(!sitemapXml.includes("infosys-tcs-wipro-green-card-perm-suspension"), "Sitemap excludes archived PERM article");
  assert(!sitemapXml.includes("react-error-130-turbopack-postmortem"), "Sitemap excludes unpublished drafts");
  assert(sitemapXml.includes("<loc>https://lokeshsain.vercel.app</loc>"), "Sitemap includes portfolio homepage");
  assert(sitemapXml.includes("<loc>https://lokeshsain.vercel.app/blog</loc>"), "Sitemap includes blog index");

  // 5. Publisher ID & ads.txt Verification
  console.log("\n--- 5. Publisher ID & ads.txt Verification ---");
  const adsRes = await fetch(`${BASE_URL}/ads.txt`, { cache: "no-store" });
  assert(adsRes.status === 200, `/ads.txt returns HTTP 200 (actual: ${adsRes.status})`);
  const adsText = await adsRes.text();
  assert(adsText.includes("pub-4833006824493392"), `ads.txt includes authorized publisher ID (pub-4833006824493392)`);

  const privRes = await fetch(`${BASE_URL}/privacy-policy`, { cache: "no-store" });
  const privHtml = await privRes.text();
  assert(privHtml.includes("4833006824493392"), "Privacy policy includes verified publisher ID");
  assert(!privHtml.includes("ca-pub-6421974191427219"), "Privacy policy does NOT contain stale publisher ID");

  // 6. Security & CSP Checks
  console.log("\n--- 6. Production Security & CSP Checks ---");
  const cspHeader = blogRes.headers.get("content-security-policy") || "";
  assert(!cspHeader.includes("'unsafe-eval'") && !cspHeader.includes('"unsafe-eval"'), "Live CSP strictly excludes 'unsafe-eval'");
  assert(cspHeader.includes("pagead2.googlesyndication.com"), "Live CSP permits Google AdSense");

  // 7. Portfolio Homepage Preservation
  console.log("\n--- 7. Portfolio Homepage Preservation ---");
  const homeRes = await fetch(`${BASE_URL}/`, { cache: "no-store" });
  assert(homeRes.status === 200, `Homepage returns HTTP 200 (actual: ${homeRes.status})`);
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes("Lokesh Sain"), "Homepage includes owner name");
  assert(homeHtml.includes("JZunto"), "Homepage preserves portfolio project JZunto");
  assert(homeHtml.includes("3Handshake"), "Homepage preserves work experience");

  console.log("\n=============================================================");
  if (failed === 0) {
    console.log(`ALL ${passed} LIVE PRODUCTION REGRESSION CHECKS PASSED!`);
    console.log("=============================================================");
    process.exit(0);
  } else {
    console.error(`FAILED: ${failed} checks failed, ${passed} passed.`);
    console.log("=============================================================");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
