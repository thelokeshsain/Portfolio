import puppeteer from 'puppeteer';

const URL = 'https://lokeshsain.vercel.app/blog/infosys-tcs-wipro-green-card-perm-suspension';

async function main() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Test desktop
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle2' });

  const desktopInfo = await page.evaluate(() => {
    const article = document.querySelector('article');
    const h1 = document.querySelector('h1');
    const header = document.querySelector('header');
    const body = document.querySelector('.p-body');
    const cover = document.querySelector('.p-cover-container');

    return {
      articleClass: article?.className,
      articleWidth: article ? window.getComputedStyle(article).width : null,
      articleMaxWidth: article ? window.getComputedStyle(article).maxWidth : null,
      articleMargin: article ? window.getComputedStyle(article).margin : null,
      articlePadding: article ? window.getComputedStyle(article).padding : null,
      h1Class: h1?.className,
      h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
      h1FontFamily: h1 ? window.getComputedStyle(h1).fontFamily : null,
      h1LineHeight: h1 ? window.getComputedStyle(h1).lineHeight : null,
      headerClass: header?.className,
      bodyWidth: body ? window.getComputedStyle(body).width : null,
      bodyMaxWidth: body ? window.getComputedStyle(body).maxWidth : null,
      coverWidth: cover ? window.getComputedStyle(cover).width : null,
    };
  });

  console.log('--- DESKTOP ARTICLE EVALUATION (1440px) ---');
  console.log(JSON.stringify(desktopInfo, null, 2));

  // Test mobile
  await page.setViewport({ width: 375, height: 812 });
  await page.reload({ waitUntil: 'networkidle2' });

  const mobileInfo = await page.evaluate(() => {
    const article = document.querySelector('article');
    const h1 = document.querySelector('h1');
    const tableWrapper = document.querySelector('.editorial-table-wrapper');
    const table = document.querySelector('.editorial-table');

    return {
      articleWidth: article ? window.getComputedStyle(article).width : null,
      articlePadding: article ? window.getComputedStyle(article).padding : null,
      h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
      tableWrapperOverflowX: tableWrapper ? window.getComputedStyle(tableWrapper).overflowX : null,
      tableWidth: table ? window.getComputedStyle(table).width : null,
    };
  });

  console.log('\n--- MOBILE ARTICLE EVALUATION (375px) ---');
  console.log(JSON.stringify(mobileInfo, null, 2));

  await browser.close();
}

main().catch(console.error);
