import puppeteer from 'puppeteer';

const URL = 'https://lokeshsain.vercel.app';

const VIEWPORTS = [
  280, 320, 344, 360, 375, 390, 414, 430, 480, 540, 600,
  640, 768, 820, 912, 1024, 1180, 1280, 1366, 1440, 1600,
  1920, 2560, 3440
];

async function runAudit() {
  console.log(`Starting Full Portfolio Responsive Forensic Audit on ${URL}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle2' });

  // 1. Audit OpenAI Logo visibility on current live site
  const openaiInfo = await page.evaluate(() => {
    const openaiImgs = Array.from(document.querySelectorAll('img[src*="openai.svg"]'));
    return openaiImgs.map(img => {
      const rect = img.getBoundingClientRect();
      const style = window.getComputedStyle(img);
      const parentStyle = window.getComputedStyle(img.parentElement);
      return {
        src: img.src,
        width: rect.width,
        height: rect.height,
        opacity: style.opacity,
        display: style.display,
        visibility: style.visibility,
        filter: style.filter,
        parentBg: parentStyle.backgroundColor,
      };
    });
  });
  console.log('\n--- OPENAI LOGO AUDIT ---');
  console.log(JSON.stringify(openaiInfo, null, 2));

  // 2. Audit Social Accounts on current live site
  const socialLinks = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="github.com"], a[href*="linkedin.com"], a[href*="instagram.com"], a[href*="x.com"], a[href*="twitter.com"]'));
    return anchors.map(a => ({
      href: a.href,
      text: a.innerText.trim(),
      ariaLabel: a.getAttribute('aria-label'),
      section: a.closest('header, footer, section')?.tagName || 'unknown',
    }));
  });
  console.log('\n--- SOCIAL LINKS CURRENTLY PRESENT ---');
  console.log(JSON.stringify(socialLinks, null, 2));

  // 3. Viewport Sweep
  console.log('\n--- VIEWPORT SWEEP ---');
  const issues = [];

  for (const width of VIEWPORTS) {
    await page.setViewport({ width, height: 900 });
    await new Promise(r => setTimeout(r, 80));

    const result = await page.evaluate((w) => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      const bodyScrollW = document.body.scrollWidth;
      const effectiveW = Math.max(scrollW, bodyScrollW);

      // Check Navbar collision
      const nav = document.querySelector('header.nav nav');
      const logo = document.querySelector('.nav-logo');
      const resumeBtn = document.querySelector('.resume-btn');
      const hamburger = document.querySelector('.hamburger');

      let navCollision = false;
      if (logo && (resumeBtn || hamburger)) {
        const logoRect = logo.getBoundingClientRect();
        const rightRect = (hamburger && window.getComputedStyle(hamburger).display !== 'none')
          ? hamburger.getBoundingClientRect()
          : (resumeBtn ? resumeBtn.getBoundingClientRect() : null);

        if (rightRect && logoRect.right > rightRect.left - 4) {
          navCollision = true;
        }
      }

      // Check tech strip wrap / overflow
      const techStrip = document.querySelector('.inner');

      // Check Contact form
      const contactForm = document.querySelector('#contact form');
      const contactRect = contactForm ? contactForm.getBoundingClientRect() : null;

      return {
        width: w,
        docW,
        effectiveW,
        hasOverflow: effectiveW > docW + 1,
        overflowPx: Math.max(0, effectiveW - docW),
        navCollision,
      };
    }, width);

    console.log(`[${width}px] Doc: ${result.docW} | Scroll: ${result.effectiveW} | Overflow: ${result.hasOverflow ? result.overflowPx + 'px' : 'NONE'} | Nav Collision: ${result.navCollision}`);
    if (result.hasOverflow || result.navCollision) {
      issues.push(result);
    }
  }

  await browser.close();
}

runAudit().catch(console.error);
