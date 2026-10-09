import http from 'http';
import { spawn } from 'child_process';
import puppeteer from 'puppeteer';

const PORT = 3010;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const VIEWPORTS = [320, 329, 344, 360, 375, 390, 430, 540, 768, 1024, 1440, 1920];

function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      http.get(url, (res) => {
        if (res.statusCode < 500) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          reject(new Error(`Server at ${url} did not respond within ${timeoutMs}ms`));
        }
      });
    }, 400);
  });
}

async function runTest() {
  console.log(`Starting local server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    shell: true,
    stdio: 'ignore'
  });

  try {
    await waitForServer(BASE_URL);
    console.log(`Server ready at ${BASE_URL}`);

    // Check Permissions-Policy header
    console.log('\n--- 1. CHECKING PERMISSIONS-POLICY HEADER ---');
    const headerCheck = await new Promise((resolve, reject) => {
      http.get(`${BASE_URL}/blog`, (res) => {
        const pp = res.headers['permissions-policy'] || '';
        resolve({
          permissionsPolicy: pp,
          hasInterestCohort: pp.includes('interest-cohort'),
          status: res.statusCode
        });
      }).on('error', reject);
    });
    console.log('Permissions-Policy header:', headerCheck.permissionsPolicy);
    console.log('Contains interest-cohort?', headerCheck.hasInterestCohort ? 'YES (FAIL)' : 'NO (PASS)');
    if (headerCheck.hasInterestCohort) {
      throw new Error('Permissions-Policy still contains interest-cohort!');
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/blog`, { waitUntil: 'networkidle2' });

    // Capture screenshot at 329px after repair
    await page.setViewport({ width: 329, height: 900, deviceScaleFactor: 2 });
    await page.screenshot({ path: 'scripts/blog_329_repaired.png', fullPage: true });
    console.log('Captured screenshot at scripts/blog_329_repaired.png');

    console.log('\n--- 2. DETAILED CARD METRICS AT 329px ---');
    const metrics329 = await page.evaluate(() => {
      const card = document.querySelector('.p-lead-card');
      const content = document.querySelector('.p-lead-content');
      const meta = document.querySelector('.p-lead-meta');
      const title = document.querySelector('.p-lead-title');
      const dek = document.querySelector('.p-lead-dek');
      const authorCard = document.querySelector('.p-about-author-card');

      return {
        cardWidth: card ? card.getBoundingClientRect().width : 0,
        contentWidth: content ? content.getBoundingClientRect().width : 0,
        contentScrollWidth: content ? content.scrollWidth : 0,
        metaScrollWidth: meta ? meta.scrollWidth : 0,
        metaClientWidth: meta ? meta.clientWidth : 0,
        titleScrollWidth: title ? title.scrollWidth : 0,
        titleClientWidth: title ? title.clientWidth : 0,
        dekScrollWidth: dek ? dek.scrollWidth : 0,
        dekClientWidth: dek ? dek.clientWidth : 0,
        authorCardWidth: authorCard ? authorCard.getBoundingClientRect().width : 0,
      };
    });
    console.log(JSON.stringify(metrics329, null, 2));

    // Assertions at 329px
    if (metrics329.contentWidth > metrics329.cardWidth + 1) {
      throw new Error(`Content width (${metrics329.contentWidth}px) exceeds card width (${metrics329.cardWidth}px)!`);
    }
    if (metrics329.dekScrollWidth > metrics329.dekClientWidth + 1) {
      throw new Error(`Excerpt (dek) is clipped! scroll: ${metrics329.dekScrollWidth}px > client: ${metrics329.dekClientWidth}px`);
    }
    if (metrics329.metaScrollWidth > metrics329.metaClientWidth + 1) {
      throw new Error(`Metadata row is clipped! scroll: ${metrics329.metaScrollWidth}px > client: ${metrics329.metaClientWidth}px`);
    }
    console.log('SUCCESS: All 329px card metrics fit within bounds without any clipping!');

    console.log('\n--- 3. MULTI-VIEWPORT VERIFICATION SWEEP ---');
    const failures = [];
    for (const w of VIEWPORTS) {
      await page.setViewport({ width: w, height: 900 });
      await new Promise(r => setTimeout(r, 60));

      const res = await page.evaluate((width) => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const card = document.querySelector('.p-lead-card');
        const content = document.querySelector('.p-lead-content');
        const meta = document.querySelector('.p-lead-meta');
        const dek = document.querySelector('.p-lead-dek');

        const cardW = card ? card.getBoundingClientRect().width : 0;
        const contentW = content ? content.getBoundingClientRect().width : 0;
        const contentScrollW = content ? content.scrollWidth : 0;
        const metaScrollW = meta ? meta.scrollWidth : 0;
        const metaClientW = meta ? meta.clientWidth : 0;
        const dekScrollW = dek ? dek.scrollWidth : 0;
        const dekClientW = dek ? dek.clientWidth : 0;

        const hasDocOverflow = scrollW > docW + 1;
        const hasCardOverflow = contentW > cardW + 1;
        const hasDekClipping = dekScrollW > dekClientW + 1;
        const hasMetaClipping = metaScrollW > metaClientW + 1;

        return {
          width,
          docW,
          scrollW,
          cardW,
          contentW,
          hasDocOverflow,
          hasCardOverflow,
          hasDekClipping,
          hasMetaClipping,
        };
      }, w);

      console.log(`[${w}px] Doc: ${res.docW}px | Card: ${Math.round(res.cardW)}px | Content: ${Math.round(res.contentW)}px | Dek Clipped: ${res.hasDekClipping} | Meta Clipped: ${res.hasMetaClipping} | Overflow: ${res.hasDocOverflow}`);
      if (res.hasDocOverflow || res.hasCardOverflow || res.hasDekClipping || res.hasMetaClipping) {
        failures.push(res);
      }
    }

    await browser.close();

    if (failures.length > 0) {
      console.error('FAILURES:', failures);
      process.exit(1);
    } else {
      console.log('\nALL VIEWPORTS PASSED WITH ZERO CLIPPING AND ZERO OVERFLOW!');
    }

  } finally {
    server.kill();
  }
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
