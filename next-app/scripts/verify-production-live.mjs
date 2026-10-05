import puppeteer from 'puppeteer';

const PROD_URL = 'https://lokeshsain.vercel.app';

async function main() {
  console.log('=== LIVE PRODUCTION VERIFICATION ===\n');

  // 1. Hero Image Optimization Endpoint
  const optImgUrl = `${PROD_URL}/_next/image?url=%2Fimages%2Fhero_laptop_mockup.webp&w=828&q=75`;
  const resOpt = await fetch(optImgUrl);
  console.log(`1. Next/Image Hero Optimization URL: ${optImgUrl}`);
  console.log(`   HTTP Status: ${resOpt.status}`);
  console.log(`   Content-Type: ${resOpt.headers.get('content-type')}`);
  console.log(`   Content-Length: ${resOpt.headers.get('content-length') || (await resOpt.arrayBuffer()).byteLength} bytes\n`);

  // 2. Production HTML Audit
  const resHtml = await fetch(`${PROD_URL}/`, { headers: { 'Cache-Control': 'no-cache' } });
  const html = await resHtml.text();

  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const descMatch = html.match(/<meta name="description" content="(.*?)"/);
  const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
  const ogDescMatch = html.match(/<meta property="og:description" content="(.*?)"/);
  const ogSiteNameMatch = html.match(/<meta property="og:site_name" content="(.*?)"/);

  console.log('2. Production SEO & Identity:');
  console.log(`   Title: ${titleMatch ? titleMatch[1] : 'NOT FOUND'}`);
  console.log(`   Description: ${descMatch ? descMatch[1] : 'NOT FOUND'}`);
  console.log(`   OG Title: ${ogTitleMatch ? ogTitleMatch[1] : 'NOT FOUND'}`);
  console.log(`   OG Description: ${ogDescMatch ? ogDescMatch[1] : 'NOT FOUND'}`);
  console.log(`   OG Site Name: ${ogSiteNameMatch ? ogSiteNameMatch[1] : 'NOT FOUND'}\n`);

  // 3. Check for 3Handshake occurrences in Production HTML
  const matches = [...html.matchAll(/(.{0,30}3Handshake.{0,50})/gi)];
  console.log(`3. Total 3Handshake occurrences in Production HTML: ${matches.length}`);
  matches.forEach((m, i) => console.log(`   [${i + 1}] ${m[1].trim()}`));
  console.log('');

  // 4. API Portfolio Audit
  const resApi = await fetch(`${PROD_URL}/api/portfolio`);
  const apiData = await resApi.json();
  console.log('4. Production /api/portfolio:');
  console.log(`   hero.name: ${apiData.hero?.name}`);
  console.log(`   hero.role: ${apiData.hero?.role}`);
  console.log(`   hero.description: ${apiData.hero?.description}`);
  console.log(`   hero.image: ${apiData.hero?.image}`);
  console.log(`   about[0]: ${apiData.about?.[0]}`);
  console.log(`   experience entries: ${apiData.experience?.map(e => `${e.role} at ${e.company}`).join(' | ')}\n`);

  // 5. Puppeteer Visual Render Check
  console.log('5. Puppeteer Live Browser Check:');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(PROD_URL, { waitUntil: 'networkidle2' });

  // Wait for the hero image
  await page.waitForFunction(() => {
    const img = document.querySelector('#home img[alt*="modern development environment"]');
    return img && img.complete && img.naturalWidth > 0;
  }, { timeout: 15000 });

  const heroImageAudit = await page.evaluate(() => {
    const img = document.querySelector('#home img[alt*="modern development environment"]');
    return {
      src: img?.currentSrc || img?.src,
      naturalWidth: img?.naturalWidth,
      naturalHeight: img?.naturalHeight,
      displayedWidth: img?.clientWidth,
      displayedHeight: img?.clientHeight,
      complete: img?.complete,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });

  console.log(`   Hero Image Loaded: ${heroImageAudit.complete && heroImageAudit.naturalWidth > 0}`);
  console.log(`   Displayed Dimensions: ${heroImageAudit.displayedWidth}x${heroImageAudit.displayedHeight}`);
  console.log(`   Natural Dimensions: ${heroImageAudit.naturalWidth}x${heroImageAudit.naturalHeight}`);
  console.log(`   Horizontal Overflow: ${heroImageAudit.scrollWidth > heroImageAudit.innerWidth ? 'YES' : 'NO (0px)'}`);
  console.log(`   Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log('     Console error:', e));
  }

  await browser.close();
  console.log('\n=== LIVE PRODUCTION AUDIT COMPLETE ===');
}

main().catch(console.error);
