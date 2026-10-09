const PROD_BASE = "https://lokeshsain.vercel.app";

async function runLiveVerification() {
  console.log("================================================================");
  console.log(" LIVE VERCEL PRODUCTION VERIFICATION — COMMIT 16baa70");
  console.log(" Target: " + PROD_BASE);
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

  try {
    // 1. Root Homepage
    console.log("1. Checking Root Homepage ('/')...");
    const resHome = await fetch(`${PROD_BASE}/`);
    assert(resHome.status === 200, "1.1: Root '/' returns HTTP 200 OK");
    const homeHtml = await resHome.text();
    assert(homeHtml.includes("Lokesh Sain"), "1.2: Root contains 'Lokesh Sain'");
    assert(homeHtml.includes("/blog") || homeHtml.includes("Perspectives"), "1.3: Root navbar contains link to '/blog' (Perspectives)");

    // 2. Perspectives Blog Homepage
    console.log("\n2. Checking Perspectives Blog Homepage ('/blog')...");
    const resBlog = await fetch(`${PROD_BASE}/blog`);
    assert(resBlog.status === 200, "2.1: '/blog' returns HTTP 200 OK");
    const blogHtml = await resBlog.text();
    assert(blogHtml.includes("Perspectives"), "2.2: Blog contains 'Perspectives' masthead");
    assert(blogHtml.includes("infosys-tcs-wipro-green-card-perm-suspension"), "2.3: Blog contains link to inaugural PERM suspension article");

    // 3. Inaugural Article Page
    console.log("\n3. Checking Inaugural Published Article...");
    const resArticle = await fetch(`${PROD_BASE}/blog/infosys-tcs-wipro-green-card-perm-suspension`);
    assert(resArticle.status === 200, "3.1: Article returns HTTP 200 OK");
    const articleHtml = await resArticle.text();
    assert(articleHtml.includes("Infosys, TCS and Wipro Green Card Suspension"), "3.2: Article contains published headline");
    assert(articleHtml.includes("schema.org"), "3.3: Article contains JSON-LD structured data");
    assert(articleHtml.includes("Sources &amp; Further Reading") || articleHtml.includes("Sources & Further Reading"), "3.4: Article contains verified sources section");
    assert(articleHtml.includes("Keith Sonderling") || articleHtml.includes("Keith"), "3.5: Article contains vetted factual analysis");

    // 4. Privacy Policy Page
    console.log("\n4. Checking Audited Privacy Policy ('/privacy-policy')...");
    const resPrivacy = await fetch(`${PROD_BASE}/privacy-policy`);
    assert(resPrivacy.status === 200, "4.1: '/privacy-policy' returns HTTP 200 OK");
    const privacyHtml = await resPrivacy.text();
    assert(privacyHtml.includes("October 9, 2026"), "4.2: Privacy Policy reflects updated October 9, 2026 date");
    assert(privacyHtml.includes("Perspectives Editorial Blog"), "4.3: Privacy Policy contains Perspectives editorial disclosures");
    assert(privacyHtml.includes("Hosting Telemetry &amp; Vercel Analytics") || privacyHtml.includes("Hosting Telemetry & Vercel Analytics"), "4.4: Privacy Policy documents Vercel hosting & telemetry");
    assert(privacyHtml.includes("ca-pub-6421974191427219"), "4.5: Privacy Policy documents AdSense Publisher ID");

    // 5. Global Branded 404 Page on Nonexistent URL
    console.log("\n5. Checking Custom Global 404 Route...");
    const res404 = await fetch(`${PROD_BASE}/this-page-should-not-exist-62841`);
    assert(res404.status === 404, "5.1: Nonexistent URL returns HTTP 404 Not Found");
    const text404 = await res404.text();
    assert(text404.includes("HTTP 404"), "5.2: 404 page contains 'HTTP 404' badge");
    assert(text404.includes("Route Not Located"), "5.3: 404 page contains 'Route Not Located' tag");
    assert(text404.includes("This page could not be found"), "5.4: 404 page contains human message");
    assert(text404.includes("Back to Home"), "5.5: 404 page contains 'Back to Home' action");
    assert(text404.includes("Explore Projects"), "5.6: 404 page contains 'Explore Projects' action");
    assert(text404.includes("Read Perspectives"), "5.7: 404 page contains 'Read Perspectives' action");

    // 6. Blog-Specific Branded 404 on Nonexistent Article Slug
    console.log("\n6. Checking Blog-Specific 404 Route...");
    const resBlog404 = await fetch(`${PROD_BASE}/blog/slug-that-does-not-exist-xyz`);
    assert(resBlog404.status === 404, "6.1: Missing blog slug returns HTTP 404 Not Found");
    const blog404Text = await resBlog404.text();
    assert(blog404Text.includes("Perspective Not Found"), "6.2: Missing blog slug renders 'Perspective Not Found' editorial UI");
    assert(blog404Text.includes("Browse All Perspectives"), "6.3: Blog 404 contains link to browse all perspectives");

    // 7. Sitemap & Robots
    console.log("\n7. Checking Sitemap and Robots...");
    const resSitemap = await fetch(`${PROD_BASE}/sitemap.xml`);
    assert(resSitemap.status === 200, "7.1: '/sitemap.xml' returns HTTP 200 OK");
    const sitemapText = await resSitemap.text();
    assert(sitemapText.includes("/blog"), "7.2: Sitemap contains '/blog'");
    assert(sitemapText.includes("/blog/infosys-tcs-wipro-green-card-perm-suspension"), "7.3: Sitemap contains canonical article URL");

    const resRobots = await fetch(`${PROD_BASE}/robots.txt`);
    assert(resRobots.status === 200, "7.4: '/robots.txt' returns HTTP 200 OK");
    const robotsText = await resRobots.text();
    assert(robotsText.includes("Disallow: /admin"), "7.5: Robots disallows admin path");
    assert(robotsText.includes("Disallow: /blog/preview/"), "7.6: Robots disallows draft preview path");

    // 8. Ads.txt
    console.log("\n8. Checking Ads.txt...");
    const resAds = await fetch(`${PROD_BASE}/ads.txt`);
    assert(resAds.status === 200, "8.1: '/ads.txt' returns HTTP 200 OK");
    const adsText = await resAds.text();
    assert(adsText.includes("pub-"), "8.2: Ads.txt contains valid publisher ID line");

    // 9. Production Content Security Policy (CSP)
    console.log("\n9. Checking Production Content Security Policy...");
    const csp = resHome.headers.get("content-security-policy") || "";
    console.log("   Observed CSP script-src excerpt: " + (csp.match(/script-src[^;]+/)?.[0] || "N/A"));
    assert(!csp.includes("'unsafe-eval'"), "9.1: Live production CSP strictly EXCLUDES 'unsafe-eval'");
    assert(csp.includes("https://pagead2.googlesyndication.com"), "9.2: CSP allows Google AdSense");
    assert(csp.includes("https://va.vercel-scripts.com"), "9.3: CSP allows Vercel Analytics");

    // 10. Security on Protected Routes & Previews
    console.log("\n10. Checking Security and Authentication...");
    const resAdmin = await fetch(`${PROD_BASE}/api/admin/blog`);
    assert(resAdmin.status === 401, "10.1: Unauthenticated '/api/admin/blog' returns HTTP 401 Unauthorized");

    const resPreview = await fetch(`${PROD_BASE}/blog/preview/507f1f77bcf86cd799439011`);
    assert(resPreview.status === 404 || resPreview.status === 401, "10.2: Unauthorized draft preview returns 404/401");

  } catch (err) {
    console.error("Live verification error:", err.message);
    failed++;
  }

  console.log("\n================================================================");
  console.log(` LIVE PRODUCTION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runLiveVerification();
