async function inspect() {
  console.log("=== INSPECTING LIVE PRODUCTION: https://lokeshsain.vercel.app/ ===");
  
  // 1. Check /blog
  const blogRes = await fetch("https://lokeshsain.vercel.app/blog", { cache: "no-store" });
  console.log("\n--- 1. Blog Index (/blog) ---");
  console.log("HTTP Status:", blogRes.status);
  console.log("Vercel ID:", blogRes.headers.get("x-vercel-id"));
  console.log("Vercel Cache:", blogRes.headers.get("x-vercel-cache"));
  console.log("Age:", blogRes.headers.get("age"));
  const blogHtml = await blogRes.text();
  const blogTitle = blogHtml.match(/<title>(.*?)<\/title>/i);
  console.log("Title:", blogTitle ? blogTitle[1] : "None");
  console.log("Contains 'Infosys, TCS and Wipro'?", blogHtml.includes("Infosys, TCS and Wipro"));
  console.log("Contains 'All Perspectives'?", blogHtml.includes("All Perspectives"));
  console.log("Contains 'Geopolitics'?", blogHtml.includes("Geopolitics"));
  console.log("Contains 'Technology'?", blogHtml.includes("Technology"));
  console.log("Contains 'Sports'?", blogHtml.includes("Sports"));
  console.log("Contains 'Perspectives in Editorial Review'?", blogHtml.includes("Perspectives in Editorial Review"));

  // 2. Check direct article URL
  const articleUrl = "https://lokeshsain.vercel.app/blog/infosys-tcs-wipro-green-card-perm-suspension";
  const artRes = await fetch(articleUrl, { cache: "no-store" });
  console.log("\n--- 2. Direct Article Route (/blog/infosys-tcs-wipro-green-card-perm-suspension) ---");
  console.log("HTTP Status:", artRes.status);
  console.log("Vercel ID:", artRes.headers.get("x-vercel-id"));
  console.log("Vercel Cache:", artRes.headers.get("x-vercel-cache"));
  const artHtml = await artRes.text();
  const artTitle = artHtml.match(/<title>(.*?)<\/title>/i);
  console.log("Title:", artTitle ? artTitle[1] : "None");
  const artH1 = artHtml.match(/<h1[^>]*>(.*?)<\/h1>/i);
  console.log("H1:", artH1 ? artH1[1] : "None");
  console.log("Contains article text?", artHtml.includes("Infosys, TCS and Wipro Green Card Suspension"));
  console.log("Contains 404 / Page Not Found?", artHtml.includes("404") || artHtml.includes("Page Not Found") || artHtml.includes("not found"));

  // 3. Check Sitemap
  const sitemapRes = await fetch("https://lokeshsain.vercel.app/sitemap.xml", { cache: "no-store" });
  console.log("\n--- 3. XML Sitemap (/sitemap.xml) ---");
  console.log("HTTP Status:", sitemapRes.status);
  const sitemapXml = await sitemapRes.text();
  console.log("Sitemap contains article URL?", sitemapXml.includes("infosys-tcs-wipro-green-card-perm-suspension"));
  console.log("Total <loc> entries in sitemap:", (sitemapXml.match(/<loc>/g) || []).length);
  const locs = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  console.log("Sitemap URLs:", locs);

  // 4. Check ads.txt
  const adsRes = await fetch("https://lokeshsain.vercel.app/ads.txt", { cache: "no-store" });
  console.log("\n--- 4. ads.txt ---");
  console.log("HTTP Status:", adsRes.status);
  const adsText = await adsRes.text();
  console.log("ads.txt content:\n" + adsText.trim());

  // 5. Check Privacy Policy
  const privRes = await fetch("https://lokeshsain.vercel.app/privacy-policy", { cache: "no-store" });
  console.log("\n--- 5. Privacy Policy (/privacy-policy) ---");
  console.log("HTTP Status:", privRes.status);
  const privHtml = await privRes.text();
  console.log("Contains verified publisher ID 4833006824493392?", privHtml.includes("4833006824493392"));
  console.log("Contains stale publisher ID 6421974191427219?", privHtml.includes("6421974191427219"));
}

inspect().catch(err => {
  console.error("Inspection error:", err);
  process.exit(1);
});
