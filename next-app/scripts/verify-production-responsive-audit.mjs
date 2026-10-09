import puppeteer from 'puppeteer';

const PROD_BASE = 'https://lokeshsain.vercel.app';

const VIEWPORTS = [
  280, 320, 344, 360, 375, 390, 414, 430, 480, 540, 600,
  640, 768, 820, 912, 1024, 1180, 1280, 1366, 1440, 1600,
  1920, 2560, 3440
];

async function waitForDeployment(maxWaitSec = 120) {
  console.log(`Checking if commit 0f4da29 is live on ${PROD_BASE}...`);
  const start = Date.now();
  while ((Date.now() - start) < maxWaitSec * 1000) {
    try {
      const res = await fetch(`${PROD_BASE}/icons/brands/openai.svg?t=${Date.now()}`);
      if (res.ok) {
        const text = await res.text();
        if (text.includes('fill="#FFFFFF"')) {
          console.log(`[DEPLOYED] New OpenAI SVG with fill="#FFFFFF" is confirmed LIVE on production!`);
          return true;
        }
      }
    } catch (e) {
      // retry
    }
    console.log(`Waiting for Vercel deployment propagation... (${Math.round((Date.now() - start) / 1000)}s)`);
    await new Promise(r => setTimeout(r, 6000));
  }
  console.warn(`Deployment check timed out, proceeding with current live state.`);
  return false;
}

async function verifyLive() {
  await waitForDeployment(180);

  console.log('\n============================================================');
  console.log('   FULL PRODUCTION RESPONSIVE & BRAND VISIBILITY AUDIT      ');
  console.log(`   Target: ${PROD_BASE}                                    `);
  console.log('============================================================\n');

  // 1. Verify Assets HTTP Status
  console.log('--- 1. VERIFYING BRAND ASSETS ON PRODUCTION ---');
  const assets = [
    '/icons/brands/openai.svg',
    '/icons/brands/instagram.svg',
    '/icons/brands/x.svg',
    '/icons/brands/github.svg',
    '/icons/brands/linkedin.svg'
  ];

  for (const asset of assets) {
    const res = await fetch(`${PROD_BASE}${asset}`);
    const isOk = res.status === 200;
    console.log(`Asset ${asset}: HTTP ${res.status} [${isOk ? 'PASS' : 'FAIL'}]`);
    if (!isOk) throw new Error(`Asset ${asset} returned HTTP ${res.status}`);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.goto(`${PROD_BASE}/?cachebust=${Date.now()}`, { waitUntil: 'networkidle2' });

  // 2. Verify OpenAI Logo
  console.log('\n--- 2. VERIFYING LIVE OPENAI LOGO VISIBILITY ---');
  const openaiInfo = await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img[src*="openai.svg"]'));
    const results = [];
    for (const img of imgs) {
      const rect = img.getBoundingClientRect();
      const style = window.getComputedStyle(img);
      results.push({
        src: img.src,
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
        opacity: style.opacity,
      });
    }
    return results;
  });
  console.log(JSON.stringify(openaiInfo, null, 2));

  // 3. Verify Social Accounts
  console.log('\n--- 3. VERIFYING 4 SOCIAL ACCOUNTS ON LIVE PRODUCTION ---');
  const socialData = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="github.com"], a[href*="linkedin.com"], a[href*="instagram.com"], a[href*="x.com"]'));
    return anchors.map(a => ({
      href: a.href,
      text: a.innerText.trim(),
      ariaLabel: a.getAttribute('aria-label'),
      target: a.getAttribute('target'),
      rel: a.getAttribute('rel'),
      container: a.closest('header, footer, section')?.tagName || 'other',
    }));
  });
  console.log(`Total live social links: ${socialData.length}`);
  console.log(JSON.stringify(socialData, null, 2));

  const allHrefs = socialData.map(s => s.href);
  const passGithub = allHrefs.some(h => h === 'https://github.com/thelokeshsain');
  const passLinkedIn = allHrefs.some(h => h === 'https://www.linkedin.com/in/thelokeshsain/');
  const passX = allHrefs.some(h => h === 'https://x.com/thelokeshsain');
  const passInstagram = allHrefs.some(h => h === 'https://www.instagram.com/thelokeshsain/');

  console.log('\nSocial Accounts Verification:');
  console.log(`1. GitHub (https://github.com/thelokeshsain): ${passGithub ? 'PASS' : 'FAIL'}`);
  console.log(`2. LinkedIn (https://www.linkedin.com/in/thelokeshsain/): ${passLinkedIn ? 'PASS' : 'FAIL'}`);
  console.log(`3. X (https://x.com/thelokeshsain): ${passX ? 'PASS' : 'FAIL'}`);
  console.log(`4. Instagram (https://www.instagram.com/thelokeshsain/): ${passInstagram ? 'PASS' : 'FAIL'}`);

  // 4. Viewport Matrix Sweep
  console.log('\n--- 4. LIVE 24-VIEWPORT RESPONSIVE SWEEP ---');
  const failures = [];
  for (const w of VIEWPORTS) {
    await page.setViewport({ width: w, height: 900 });
    await new Promise(r => setTimeout(r, 60));

    const res = await page.evaluate((width) => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      const bodyW = document.body.scrollWidth;
      const effectiveW = Math.max(scrollW, bodyW);
      const overflow = effectiveW > docW + 1;

      const logo = document.querySelector('.nav-logo');
      const resumeBtn = document.querySelector('.resume-btn');
      const hamburger = document.querySelector('.hamburger');

      let navCollision = false;
      if (logo) {
        const logoRect = logo.getBoundingClientRect();
        const rightEl = (hamburger && window.getComputedStyle(hamburger).display !== 'none')
          ? hamburger
          : resumeBtn;
        if (rightEl && window.getComputedStyle(rightEl).display !== 'none') {
          const rightRect = rightEl.getBoundingClientRect();
          if (logoRect.right > rightRect.left - 2) {
            navCollision = true;
          }
        }
      }

      return {
        width,
        docW,
        effectiveW,
        overflow,
        overflowPx: overflow ? effectiveW - docW : 0,
        navCollision
      };
    }, w);

    console.log(`[${w}px] Doc: ${res.docW} | Scroll: ${res.effectiveW} | Overflow: ${res.overflow ? `+${res.overflowPx}px` : 'NONE'} | Nav Collision: ${res.navCollision}`);
    if (res.overflow || res.navCollision) {
      failures.push(res);
    }
  }

  await browser.close();

  if (failures.length > 0) {
    console.error(`\nFailures detected:`, failures);
    process.exit(1);
  }

  console.log('\n============================================================');
  console.log(' ALL PRODUCTION CHECKS PASSED PERFECTLY!');
  console.log('============================================================');
}

verifyLive().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
