import puppeteer from "puppeteer";

const BASE_URL = "https://lokeshsain.vercel.app";

const ROUTES_TO_AUDIT = [
  { path: "/", name: "Portfolio Home" },
  { path: "/blog", name: "Perspectives Blog Index" },
  { path: "/blog?category=Technology", name: "Category Filter (Technology)" },
  { path: "/blog/infosys-tcs-wipro-green-card-perm-suspension", name: "Inaugural Perspectives Article" },
  { path: "/privacy-policy", name: "Privacy Policy" },
];

async function auditRoute(browser, route, isMobile = false) {
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  if (isMobile) {
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  } else {
    await page.setViewport({ width: 1440, height: 900 });
  }

  const url = `${BASE_URL}${route.path}`;
  const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 35000 });
  const status = response.status();

  const auditData = await page.evaluate(() => {
    const h1Count = document.querySelectorAll("h1").length;
    const h1Text = document.querySelector("h1") ? document.querySelector("h1").innerText.trim().slice(0, 80) : "";
    const title = document.title;
    const metaDesc = document.querySelector('meta[name="description"]')?.content || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.href || "";
    const hasHeader = Boolean(document.querySelector("header"));
    const hasMain = Boolean(document.querySelector("main") || document.querySelector("article"));
    const hasFooter = Boolean(document.querySelector("footer"));
    const overflowX = document.documentElement.scrollWidth > window.innerWidth;
    
    // Images without alt
    const imagesWithoutAlt = Array.from(document.querySelectorAll("img")).filter(img => !img.hasAttribute("alt") || img.alt.trim() === "").length;
    
    // JSON-LD scripts
    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
      try {
        return JSON.parse(s.innerText);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return {
      title,
      metaDesc,
      canonical,
      h1Count,
      h1Text,
      hasHeader,
      hasMain,
      hasFooter,
      overflowX,
      imagesWithoutAlt,
      jsonLdCount: jsonLdScripts.length,
      jsonLdTypes: jsonLdScripts.map(s => s["@type"] || "unknown"),
    };
  });

  await page.close();

  return {
    ...route,
    isMobile,
    status,
    consoleErrors,
    pageErrors,
    ...auditData,
  };
}

async function runQualityAudit() {
  console.log("================================================================");
  console.log(" PRODUCTION QUALITY & AGENTIC BROWSING AUDIT GATE");
  console.log(" Target: " + BASE_URL);
  console.log("================================================================\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const route of ROUTES_TO_AUDIT) {
      console.log(`Auditing ${route.name} (${route.path})...`);
      
      const desktop = await auditRoute(browser, route, false);
      const mobile = await auditRoute(browser, route, true);

      console.log(`  [Desktop] Status: ${desktop.status} | H1s: ${desktop.h1Count} ("${desktop.h1Text.slice(0, 30)}...") | Title: ${desktop.title.slice(0, 40)}...`);
      console.log(`            Semantic Landmarks (header/main/footer): ${desktop.hasHeader && desktop.hasMain && desktop.hasFooter ? "YES" : "NO"} | JSON-LD: ${desktop.jsonLdCount} (${desktop.jsonLdTypes.join(", ") || "none"})`);
      console.log(`            Console Errors: ${desktop.consoleErrors.length} | Page Errors: ${desktop.pageErrors.length} | Overflow: ${desktop.overflowX}`);
      
      console.log(`  [Mobile]  Status: ${mobile.status} | Overflow: ${mobile.overflowX} | Console Errors: ${mobile.consoleErrors.length}`);
      console.log("");
    }
  } finally {
    await browser.close();
  }

  console.log("================================================================");
  console.log(" AUDIT COMPLETE — ALL ROUTE CLASSES EVALUATED");
  console.log("================================================================");
}

runQualityAudit().catch(console.error);
