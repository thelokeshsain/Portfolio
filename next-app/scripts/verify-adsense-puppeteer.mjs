import puppeteer from 'puppeteer';

const PROD_URL = 'https://lokeshsain.vercel.app';

async function verify() {
  console.log('=== FORENSIC LIVE PUPPETEER AUDIT ===\nTarget:', PROD_URL);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const consoleMessages = [];
  const warnings = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'warning') warnings.push(text);
    if (msg.type() === 'error') errors.push(text);
  });

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  await page.goto(PROD_URL, { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. Inspect AdSense script in DOM
  const adScripts = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src*="adsbygoogle"]'));
    return scripts.map(s => ({
      src: s.src,
      async: s.async,
      crossOrigin: s.crossOrigin,
      dataNscript: s.getAttribute('data-nscript'),
      id: s.id,
      parentElement: s.parentElement ? s.parentElement.tagName : null,
      outerHTML: s.outerHTML
    }));
  });

  console.log('\n1. AdSense Script Tag in Live DOM:');
  console.log(JSON.stringify(adScripts, null, 2));

  // 2. Check for empty manual Advertisement elements
  const adContainers = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('[aria-label="Advertisement"], ins.adsbygoogle'));
    return elements.map(el => ({
      tagName: el.tagName,
      className: el.className,
      ariaLabel: el.getAttribute('aria-label'),
      innerText: el.innerText.trim(),
      clientHeight: el.clientHeight,
      clientWidth: el.clientWidth,
      outerHTML: el.outerHTML.slice(0, 150)
    }));
  });

  console.log('\n2. Manual Ad Elements in Live DOM:');
  console.log(`Found: ${adContainers.length}`);
  if (adContainers.length > 0) {
    console.log(JSON.stringify(adContainers, null, 2));
  }

  // 3. Search for "Advertisement" text on page
  const adTextFound = await page.evaluate(() => {
    return document.body.innerText.includes('Advertisement');
  });
  console.log(`\n3. 'Advertisement' label text visible on page: ${adTextFound}`);

  // 4. Check for data-nscript warning or any AdSense warnings in console
  console.log('\n4. Console Warnings:');
  const adWarnings = warnings.filter(w => w.toLowerCase().includes('adsense') || w.toLowerCase().includes('nscript'));
  console.log(`AdSense/data-nscript warnings found: ${adWarnings.length}`);
  adWarnings.forEach(w => console.log('   Warning:', w));

  const dataNscriptWarning = warnings.find(w => w.includes("AdSense head tag doesn't support data-nscript"));
  console.log(`Specific 'AdSense head tag doesn't support data-nscript attribute' warning present?: ${Boolean(dataNscriptWarning)}`);

  console.log('\n5. All Console Errors:');
  console.log(`Total errors: ${errors.length}`);
  errors.forEach(e => console.log('   Error:', e));

  await browser.close();
}

verify().catch(console.error);
