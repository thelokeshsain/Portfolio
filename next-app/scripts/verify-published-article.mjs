import puppeteer from "puppeteer";

async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const logs = [];

  page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));
  page.on("pageerror", (err) => logs.push({ type: "pageerror", text: err.message }));

  await page.goto(
    "http://localhost:3000/blog/infosys-tcs-wipro-green-card-perm-suspension",
    { waitUntil: "networkidle2" }
  );

  console.log("LOGS:", logs);
  const title = await page.title();
  console.log("TITLE:", title);

  const h1 = await page.$eval("h1", (el) => el.innerText);
  console.log("H1:", h1);

  // Check structured data
  const jsonLdScripts = await page.$$eval(
    'script[type="application/ld+json"]',
    (scripts) => scripts.map((s) => JSON.parse(s.innerText))
  );
  console.log("JSON-LD Count:", jsonLdScripts.length);
  for (const s of jsonLdScripts) {
    console.log("JSON-LD Type:", s["@type"]);
  }

  // Check canonical link
  const canonical = await page.$eval('link[rel="canonical"]', (el) => el.href);
  console.log("CANONICAL:", canonical);

  // Check external links have rel="noopener noreferrer"
  const externalLinks = await page.$$eval(
    'a[target="_blank"]',
    (links) => links.map((a) => ({ href: a.href, rel: a.rel }))
  );
  console.log("EXTERNAL LINKS COUNT:", externalLinks.length);
  const badLinks = externalLinks.filter(
    (l) => !l.rel.includes("noopener") || !l.rel.includes("noreferrer")
  );
  console.log("UNSAFE LINKS COUNT:", badLinks.length);

  await browser.close();
}

main().catch(console.error);
