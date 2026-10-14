async function fullLiveAudit() {
  const articles = [
    "https://lokeshsain.vercel.app/blog/react-error-130-turbopack-postmortem",
    "https://lokeshsain.vercel.app/blog/enterprise-image-upload-nextjs-vercel-blob",
    "https://lokeshsain.vercel.app/blog/sub-350px-mobile-viewport-optimization-nextjs",
    "https://lokeshsain.vercel.app/blog/architecting-jzunto-curriculum-intelligence",
  ];

  console.log("=============================================================");
  console.log("FULL LIVE PRODUCTION AUDIT — LOKESH SAIN PORTFOLIO & PERSPECTIVES");
  console.log("=============================================================\n");

  console.log("--- 1. AUDITING 4 PUBLISHED ARTICLES ON LIVE PRODUCTION ---");
  for (const url of articles) {
    const res = await fetch(url, { headers: { "Cache-Control": "no-cache, no-store" } });
    const html = await res.text();
    const hasOldBoilerplate = /immigration counsel|statutory immigration|government allegations/i.test(html);
    const hasTechnicalStandards = html.includes("Technical Standards") && html.includes("Integrity");
    const hasCorrectionCta = html.includes("Submit Technical Correction");
    const hasCanonical = html.includes("canonical");
    console.log(`[${res.status}] ${url.split("/").pop()}`);
    console.log(`     - Irrelevant boilerplate completely absent: ${!hasOldBoilerplate}`);
    console.log(`     - Technical Standards & Integrity present: ${hasTechnicalStandards}`);
    console.log(`     - Technical Correction CTA link present: ${hasCorrectionCta}`);
    console.log(`     - Canonical URL configured: ${hasCanonical}`);
  }

  console.log("\n--- 2. AUDITING BLOG INDEX & METADATA ---");
  const blogRes = await fetch("https://lokeshsain.vercel.app/blog", { headers: { "Cache-Control": "no-cache, no-store" } });
  const blogHtml = await blogRes.text();
  console.log(`  /blog HTTP Status: ${blogRes.status}`);
  console.log(`  Contains all 4 article links: ${articles.every(u => blogHtml.includes(u.split("/").pop()))}`);
  console.log(`  Stale descriptors absent (world affairs, sport): ${!/world affairs|business and sport|global commentary/i.test(blogHtml)}`);
  console.log(`  Aligned software engineering masthead/heading: ${blogHtml.includes("Software Engineering")}`);

  console.log("\n--- 3. AUDITING ARCHIVED PERM ARTICLE ---");
  const permRes = await fetch("https://lokeshsain.vercel.app/blog/infosys-tcs-wipro-green-card-perm-suspension", { headers: { "Cache-Control": "no-cache, no-store" } });
  console.log(`  Archived PERM Article HTTP Status: ${permRes.status} (MUST BE 404)`);

  console.log("\n--- 4. AUDITING ROBOTS, SITEMAP & ADS.TXT ---");
  const robotsRes = await fetch("https://lokeshsain.vercel.app/robots.txt");
  const robotsTxt = await robotsRes.text();
  console.log(`  /robots.txt HTTP Status: ${robotsRes.status}`);
  console.log(`  Robots explicitly permits Mediapartners-Google: ${robotsTxt.includes("Mediapartners-Google")}`);
  console.log(`  Robots explicitly permits Google-Display-Ads-Bot: ${robotsTxt.includes("Google-Display-Ads-Bot")}`);

  const sitemapRes = await fetch("https://lokeshsain.vercel.app/sitemap.xml");
  const sitemapXml = await sitemapRes.text();
  console.log(`  /sitemap.xml HTTP Status: ${sitemapRes.status}`);
  console.log(`  Sitemap excludes PERM article: ${!sitemapXml.includes("perm")}`);
  console.log(`  Sitemap indexes 4 published articles: ${articles.every(u => sitemapXml.includes(u.split("/").pop()))}`);

  const adsTxtRes = await fetch("https://lokeshsain.vercel.app/ads.txt");
  const adsTxt = await adsTxtRes.text();
  console.log(`  /ads.txt HTTP Status: ${adsTxtRes.status}`);
  console.log(`  ads.txt Pub ID (4833006824493392): ${adsTxt.includes("4833006824493392")}`);

  console.log("\n=============================================================");
  console.log("PRODUCTION LIVE VERIFICATION COMPLETE");
  console.log("=============================================================");
}

fullLiveAudit().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
