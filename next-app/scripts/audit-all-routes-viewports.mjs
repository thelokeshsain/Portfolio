import puppeteer from 'puppeteer';

const BASE_URL = 'https://lokeshsain.vercel.app';
const ROUTES = [
  '/',
  '/blog',
  '/blog/infosys-tcs-wipro-green-card-perm-suspension',
  '/privacy-policy',
  '/admin/login'
];

const VIEWPORTS = [
  280, 320, 360, 414, 600, 768, 1024, 1280, 1440, 1920, 2560
];

async function testRoutes() {
  console.log(`Starting multi-route responsive check across ${ROUTES.length} routes...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const summary = {};

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    console.log(`\nTesting route: ${url}`);
    summary[route] = { overflowIssues: [] };

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (e) {
      console.error(`Failed to load ${url}: ${e.message}`);
      summary[route].error = e.message;
      continue;
    }

    for (const width of VIEWPORTS) {
      await page.setViewport({ width, height: 900 });
      await new Promise(r => setTimeout(r, 60));

      const res = await page.evaluate((w) => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const bodyW = document.body.scrollWidth;
        const maxW = Math.max(scrollW, bodyW);
        const overflow = maxW > docW + 1;
        return {
          width: w,
          docW,
          maxW,
          overflow,
          overflowPx: overflow ? maxW - docW : 0
        };
      }, width);

      if (res.overflow) {
        console.log(`  [${width}px] OVERFLOW DETECTED: +${res.overflowPx}px (max: ${res.maxW}px, doc: ${res.docW}px)`);
        summary[route].overflowIssues.push(res);
      } else {
        console.log(`  [${width}px] OK (doc: ${res.docW}px)`);
      }
    }
  }

  await browser.close();
  console.log('\n--- AUDIT SUMMARY ---');
  console.log(JSON.stringify(summary, null, 2));
}

testRoutes().catch(console.error);
