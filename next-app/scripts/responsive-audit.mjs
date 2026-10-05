import puppeteer from 'puppeteer';

const VIEWPORTS = [
  320, 360, 375, 390, 393, 412, 430, 480, 540, 600,
  768, 820, 912, 1024, 1280, 1366, 1440, 1536, 1920
];

const TARGET_URL = process.argv[2] || process.env.AUDIT_URL || 'http://localhost:3000';

async function runAudit() {
  console.log(`Starting Responsive Forensic Audit on ${TARGET_URL}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const results = [];

  for (const width of VIEWPORTS) {
    await page.setViewport({ width, height: 900 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

    const audit = await page.evaluate((w) => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      const bodyScrollW = document.body.scrollWidth;
      const effectiveScrollW = Math.max(scrollW, bodyScrollW);
      const hasOverflow = effectiveScrollW > docW + 1;

      // Find overflowing elements
      const allEls = Array.from(document.querySelectorAll('*'));
      const overflowing = [];

      for (const el of allEls) {
        // Skip script, style, head, etc.
        if (['SCRIPT', 'STYLE', 'META', 'LINK', 'NOSCRIPT'].includes(el.tagName)) continue;
        const rect = el.getBoundingClientRect();
        // Ignore invisible or 0-size elements
        if (rect.width === 0 && rect.height === 0) continue;
        
        if (rect.right > docW + 1.5) {
          // Get unique identifier
          let selector = el.tagName.toLowerCase();
          if (el.id) selector += `#${el.id}`;
          else if (el.className && typeof el.className === 'string') {
            selector += `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`;
          }

          overflowing.push({
            selector,
            snippet: el.outerHTML.slice(0, 120),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            overflowPx: Math.round(rect.right - docW)
          });
        }
      }

      return {
        viewportWidth: w,
        clientWidth: docW,
        scrollWidth: effectiveScrollW,
        overflowPx: Math.max(0, effectiveScrollW - docW),
        hasOverflow,
        overflowCount: overflowing.length,
        topOverflowing: overflowing.sort((a, b) => b.overflowPx - a.overflowPx).slice(0, 5)
      };
    }, width);

    results.push(audit);
    console.log(`[Viewport ${width}px] clientWidth: ${audit.clientWidth} | scrollWidth: ${audit.scrollWidth} | Overflow: ${audit.overflowPx}px | Issues: ${audit.overflowCount}`);
    if (audit.topOverflowing.length > 0) {
      audit.topOverflowing.forEach(o => {
        console.log(`   -> ${o.selector} (+${o.overflowPx}px): ${o.snippet}`);
      });
    }
  }

  await browser.close();
  console.log('\nAudit complete.');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
