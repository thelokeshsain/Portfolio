import puppeteer from 'puppeteer';

const VIEWPORTS = [
  320, 360, 375, 390, 393, 412, 430, 480, 540, 600, 768, 820, 912, 1024, 1280, 1366, 1440, 1536, 1920
];

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log(`Auditing ${VIEWPORTS.length} viewports on http://localhost:3000/...`);

  let allPassed = true;

  for (const width of VIEWPORTS) {
    await page.setViewport({ width, height: 900 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

    // Wait for the hero image to decode and load
    await page.waitForFunction(() => {
      const img = document.querySelector('#home img[alt*="modern development environment"]');
      return img && img.complete && img.naturalWidth > 0;
    }, { timeout: 15000 });

    const audit = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const overflow = scrollWidth > innerWidth;

      const heroImg = document.querySelector('#home img[alt*="modern development environment"]');
      const imgStatus = {
        found: !!heroImg,
        src: heroImg ? heroImg.currentSrc || heroImg.src : null,
        naturalWidth: heroImg ? heroImg.naturalWidth : 0,
        naturalHeight: heroImg ? heroImg.naturalHeight : 0,
        complete: heroImg ? heroImg.complete : false,
        displayedWidth: heroImg ? heroImg.clientWidth : 0,
        displayedHeight: heroImg ? heroImg.clientHeight : 0,
      };

      return {
        innerWidth,
        scrollWidth,
        overflow,
        imgStatus,
      };
    });

    const imgOk = audit.imgStatus.found && audit.imgStatus.complete && audit.imgStatus.naturalWidth > 0;
    const overflowOk = !audit.overflow;

    if (!imgOk || !overflowOk) {
      allPassed = false;
      console.log(`❌ Viewport ${width}px: Overflow=${audit.overflow} (scrollWidth=${audit.scrollWidth}), ImageLoaded=${imgOk} (natW=${audit.imgStatus.naturalWidth}, natH=${audit.imgStatus.naturalHeight})`);
    } else {
      console.log(`✓ Viewport ${width}px: 0px overflow, Hero Image loaded (displayed ${audit.imgStatus.displayedWidth}x${audit.imgStatus.displayedHeight}, natural ${audit.imgStatus.naturalWidth}x${audit.imgStatus.naturalHeight})`);
    }
  }

  await browser.close();

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`All 19 viewports passed: ${allPassed}`);
  console.log(`Console errors captured: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(err => console.log('Console error:', err));
  }
}

main().catch(console.error);
