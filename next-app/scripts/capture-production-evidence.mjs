import puppeteer from 'puppeteer';

const PROD_URL = 'https://lokeshsain.vercel.app';

async function captureEvidence() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  // 1. Mobile viewport 360px
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2 });
  await page.goto(PROD_URL, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'scripts/evidence_mobile_360.png', fullPage: false });

  // 2. Mobile Footer 360px
  const footer = await page.$('footer');
  if (footer) {
    await footer.screenshot({ path: 'scripts/evidence_footer_mobile_360.png' });
  }

  // 3. Desktop 1280px
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto(PROD_URL, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'scripts/evidence_desktop_1280.png', fullPage: false });

  const footerDesktop = await page.$('footer');
  if (footerDesktop) {
    await footerDesktop.screenshot({ path: 'scripts/evidence_footer_desktop_1280.png' });
  }

  // 4. Skills section with OpenAI logo
  const skills = await page.$('#skills');
  if (skills) {
    await skills.screenshot({ path: 'scripts/evidence_skills_openai.png' });
  }

  console.log('Visual evidence screenshots successfully captured!');
  await browser.close();
}

captureEvidence().catch(console.error);
