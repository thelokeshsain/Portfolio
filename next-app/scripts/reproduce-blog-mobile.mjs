import puppeteer from 'puppeteer';

const PROD_URL = 'https://lokeshsain.vercel.app/blog';

const VIEWPORTS = [320, 329, 344, 360, 375, 390, 430, 540, 768, 1024, 1440, 1920];

async function runReproduction() {
  console.log(`Starting forensic reproduction on ${PROD_URL}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.goto(PROD_URL, { waitUntil: 'networkidle2' });

  // Capture screenshot at 329px before fix
  await page.setViewport({ width: 329, height: 900, deviceScaleFactor: 2 });
  await page.screenshot({ path: 'scripts/blog_329_before.png', fullPage: true });

  console.log('\n--- DETAILED INSPECTION AT 329px ---');
  const details329 = await page.evaluate(() => {
    const card = document.querySelector('.p-lead-card');
    const cardGrid = document.querySelector('.p-lead-grid');
    const content = document.querySelector('.p-lead-content');
    const meta = document.querySelector('.p-lead-meta');
    const title = document.querySelector('.p-lead-title');
    const dek = document.querySelector('.p-lead-dek');
    const container = document.querySelector('.p-container');
    const topInner = document.querySelector('.p-masthead-top-inner');

    function getInfo(el, name) {
      if (!el) return { name, exists: false };
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        name,
        width: rect.width,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        left: rect.left,
        right: rect.right,
        overflowX: style.overflowX,
        isClipped: el.scrollWidth > el.clientWidth,
      };
    }

    return {
      docWidth: document.documentElement.clientWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      container: getInfo(container, 'container'),
      card: getInfo(card, 'card'),
      cardGrid: getInfo(cardGrid, 'cardGrid'),
      content: getInfo(content, 'content'),
      meta: getInfo(meta, 'meta'),
      title: getInfo(title, 'title'),
      dek: getInfo(dek, 'dek'),
      topInner: getInfo(topInner, 'topInner'),
    };
  });
  console.log(JSON.stringify(details329, null, 2));

  console.log('\n--- MULTI-VIEWPORT AUDIT OF CLIPPED ELEMENTS ---');
  for (const w of VIEWPORTS) {
    await page.setViewport({ width: w, height: 900 });
    await new Promise(r => setTimeout(r, 60));

    const check = await page.evaluate((width) => {
      const card = document.querySelector('.p-lead-card');
      const content = document.querySelector('.p-lead-content');
      const meta = document.querySelector('.p-lead-meta');
      const dek = document.querySelector('.p-lead-dek');

      let cardW = card ? card.getBoundingClientRect().width : 0;
      let contentW = content ? content.getBoundingClientRect().width : 0;
      let metaScrollW = meta ? meta.scrollWidth : 0;
      let metaClientW = meta ? meta.clientWidth : 0;
      let dekScrollW = dek ? dek.scrollWidth : 0;
      let dekClientW = dek ? dek.clientWidth : 0;

      const metaClipped = metaScrollW > metaClientW + 1;
      const contentOverflowsCard = contentW > cardW + 1;

      return {
        width,
        cardW,
        contentW,
        contentOverflowsCard,
        metaClientW,
        metaScrollW,
        metaClipped,
      };
    }, w);

    console.log(`[${w}px] Card: ${check.cardW}px | Content: ${check.contentW}px | Meta Clipped: ${check.metaClipped} (scroll: ${check.metaScrollW}px vs client: ${check.metaClientW}px)`);
  }

  await browser.close();
}

runReproduction().catch(console.error);
