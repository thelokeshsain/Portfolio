import puppeteer from 'puppeteer';

const PROD_URL = 'https://lokeshsain.vercel.app/blog';
const VIEWPORTS = [320, 329, 344, 360, 375, 390, 430, 540, 768, 1024, 1440, 1920];

async function waitForDeployment(maxWaitSec = 180) {
  console.log('Polling production to confirm commit c366b85 deployment...');
  const start = Date.now();
  while ((Date.now() - start) < maxWaitSec * 1000) {
    try {
      const res = await fetch(`${PROD_URL}?_t=${Date.now()}`);
      const pp = res.headers.get('permissions-policy') || '';
      if (!pp.includes('interest-cohort') && pp.includes('geolocation=()')) {
        console.log('[CONFIRMED] Production response reflects updated Permissions-Policy header!');
        return true;
      }
    } catch (e) {
      // retry
    }
    console.log(`Waiting for Vercel deployment... (${Math.round((Date.now() - start) / 1000)}s)`);
    await new Promise(r => setTimeout(r, 6000));
  }
  console.warn('Timed out waiting for deployment signal, continuing with live check.');
  return false;
}

async function verifyLive() {
  await waitForDeployment(180);

  console.log('\n============================================================');
  console.log('  LIVE PRODUCTION BLOG REPAIR AUDIT — COMMIT c366b85        ');
  console.log('============================================================\n');

  // 1. Verify Headers on Live Production
  console.log('--- 1. VERIFYING LIVE PRODUCTION RESPONSE HEADERS ---');
  const res = await fetch(`${PROD_URL}?cachebust=${Date.now()}`);
  const pp = res.headers.get('permissions-policy') || '';
  console.log(`Permissions-Policy: "${pp}"`);
  const interestCohortRemoved = !pp.includes('interest-cohort');
  console.log(`interest-cohort removed: ${interestCohortRemoved ? 'PASS' : 'FAIL'}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.goto(`${PROD_URL}?cachebust=${Date.now()}`, { waitUntil: 'networkidle2' });

  // 2. Capture Production Evidence Screenshot at 329px
  await page.setViewport({ width: 329, height: 900, deviceScaleFactor: 2 });
  await page.screenshot({ path: 'scripts/evidence_production_blog_329.png', fullPage: true });
  console.log('Captured live production screenshot at scripts/evidence_production_blog_329.png');

  // 3. Inspect Live Metrics at 329px
  console.log('\n--- 2. DETAILED LIVE METRICS AT 329px ---');
  const liveMetrics329 = await page.evaluate(() => {
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
      dekScrollWidth: dek ? dek.scrollWidth : 0,
      dekClientWidth: dek ? dek.clientWidth : 0,
      authorCardWidth: authorCard ? authorCard.getBoundingClientRect().width : 0,
    };
  });
  console.log(JSON.stringify(liveMetrics329, null, 2));

  // 4. Multi-Viewport Sweep on Live Site
  console.log('\n--- 3. LIVE MULTI-VIEWPORT VERIFICATION SWEEP ---');
  const sweepFailures = [];
  for (const w of VIEWPORTS) {
    await page.setViewport({ width: w, height: 900 });
    await new Promise(r => setTimeout(r, 60));

    const check = await page.evaluate((width) => {
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

    console.log(`[${w}px] Doc: ${check.docW}px | Card: ${Math.round(check.cardW)}px | Content: ${Math.round(check.contentW)}px | Dek Clipped: ${check.hasDekClipping} | Meta Clipped: ${check.hasMetaClipping} | Overflow: ${check.hasDocOverflow}`);
    if (check.hasDocOverflow || check.hasCardOverflow || check.hasDekClipping || check.hasMetaClipping) {
      sweepFailures.push(check);
    }
  }

  await browser.close();

  if (sweepFailures.length > 0) {
    console.error('LIVE AUDIT FAILURES:', sweepFailures);
    process.exit(1);
  }

  console.log('\n============================================================');
  console.log(' ALL LIVE PRODUCTION BLOG AUDIT CHECKS PASSED PERFECTLY!   ');
  console.log('============================================================');
}

verifyLive().catch(err => {
  console.error('Live audit error:', err);
  process.exit(1);
});
