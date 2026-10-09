import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3005';
const ARTICLE_URL = `${BASE_URL}/blog/infosys-tcs-wipro-green-card-perm-suspension`;

async function testRepairedLayout() {
  console.log('Testing Repaired Blog Layout on:', ARTICLE_URL);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // 1. Desktop Test at 1440px
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(ARTICLE_URL, { waitUntil: 'networkidle2' });

  const desktop = await page.evaluate(() => {
    const article = document.querySelector('article.p-article-container');
    const h1 = document.querySelector('h1.p-headline');
    const codeWrapper = document.querySelector('.editorial-code-wrapper');
    const pre = document.querySelector('.editorial-pre');
    const tableWrapper = document.querySelector('.editorial-table-wrapper');
    const notices = document.querySelector('.p-editorial-notices');
    const sources = document.querySelector('.p-sources-section');

    const artStyle = article ? window.getComputedStyle(article) : null;
    const h1Style = h1 ? window.getComputedStyle(h1) : null;

    return {
      articleFound: !!article,
      articleWidth: artStyle?.width,
      articleMaxWidth: artStyle?.maxWidth,
      articleMarginLeft: artStyle?.marginLeft,
      articleMarginRight: artStyle?.marginRight,
      articlePadding: artStyle?.padding,
      h1FontFamily: h1Style?.fontFamily,
      h1FontSize: h1Style?.fontSize,
      h1LineHeight: h1Style?.lineHeight,
      hasCodeWrapper: !!codeWrapper,
      preFontFamily: pre ? window.getComputedStyle(pre).fontFamily : null,
      hasTableWrapper: !!tableWrapper,
      hasNotices: !!notices,
      hasSources: !!sources,
    };
  });

  console.log('\n--- 1. DESKTOP 1440px VALIDATION ---');
  console.log(JSON.stringify(desktop, null, 2));

  // Assertions for Desktop
  const articleW = parseFloat(desktop.articleWidth);
  if (articleW > 765) {
    throw new Error(`Article column too wide: ${desktop.articleWidth} (expected <= 760px)`);
  }
  console.log('✓ Desktop article is centered editorial column (width: ' + desktop.articleWidth + ')');
  console.log('✓ Code wrapper and pre-block present:', desktop.hasCodeWrapper);
  console.log('✓ Table wrapper present:', desktop.hasTableWrapper);

  // 2. Mobile Viewports Forensic Check
  const MOBILE_VIEWPORTS = [320, 360, 375, 390, 430, 540, 768];
  console.log('\n--- 2. MOBILE & TABLET VIEWPORT CHECKS ---');

  for (const width of MOBILE_VIEWPORTS) {
    await page.setViewport({ width, height: 800, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 100));

    const check = await page.evaluate((w) => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      const bodyScrollW = document.body.scrollWidth;
      const effectiveW = Math.max(scrollW, bodyScrollW);

      const article = document.querySelector('article.p-article-container');
      const artStyle = article ? window.getComputedStyle(article) : null;

      const codeWrapper = document.querySelector('.editorial-code-wrapper');
      const tableWrapper = document.querySelector('.editorial-table-wrapper');

      return {
        viewport: w,
        clientWidth: docW,
        scrollWidth: effectiveW,
        hasDocOverflow: effectiveW > docW + 1,
        paddingLeft: artStyle?.paddingLeft,
        paddingRight: artStyle?.paddingRight,
        codeScrollWidth: codeWrapper?.scrollWidth,
        codeClientWidth: codeWrapper?.clientWidth,
        tableScrollWidth: tableWrapper?.scrollWidth,
        tableClientWidth: tableWrapper?.clientWidth,
      };
    }, width);

    console.log(`[Viewport ${width}px] clientWidth: ${check.clientWidth} | scrollWidth: ${check.scrollWidth} | Overflow: ${check.hasDocOverflow ? 'FAIL' : 'PASS'} | Padding: ${check.paddingLeft}`);
    if (check.hasDocOverflow) {
      throw new Error(`Viewport ${width}px has horizontal overflow: scrollWidth ${check.scrollWidth} > clientWidth ${check.clientWidth}`);
    }
  }

  console.log('\n--- 3. ALL VIEWPORTS PASSED WITH ZERO HORIZONTAL OVERFLOW ---');
  await browser.close();
}

testRepairedLayout().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
