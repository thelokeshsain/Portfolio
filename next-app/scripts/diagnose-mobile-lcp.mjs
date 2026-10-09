import puppeteer from 'puppeteer';

const URL = 'https://lokeshsain.vercel.app/blog/infosys-tcs-wipro-green-card-perm-suspension';

async function diagnose() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Emulate Mobile: Pixel 7 (412x915) with throttling
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const client = await page.target().createCDPSession();
  // Emulate mobile throttling: 4G (1.6 Mbps download, 750 kbps upload, 150ms RTT)
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 1.6 * 1024 * 1024 / 8,
    uploadThroughput: 750 * 1024 / 8,
    connectionType: 'cellular4g',
  });
  // 4x CPU slowdown
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const requests = [];
  client.on('Network.responseReceived', (e) => {
    requests.push({
      url: e.response.url,
      status: e.response.status,
      mimeType: e.response.mimeType,
      size: e.response.encodedDataLength,
    });
  });

  await page.evaluateOnNewDocument(() => {
    window.lcpData = null;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        window.lcpData = entries[entries.length - 1];
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  });

  const start = Date.now();
  await page.goto(URL, { waitUntil: 'networkidle2' });
  const duration = Date.now() - start;

  const lcp = await page.evaluate(() => {
    const entry = window.lcpData;
    if (!entry) return null;
    return {
      startTime: entry.startTime,
      duration: entry.duration,
      size: entry.size,
      id: entry.id,
      url: entry.url,
      element: entry.element ? entry.element.tagName + (entry.element.className ? '.' + entry.element.className : '') : null,
      elementSnippet: entry.element ? entry.element.outerHTML.slice(0, 160) : null,
    };
  });

  console.log('--- MOBILE LCP FORENSIC DIAGNOSTIC ---');
  console.log(`Total Navigation Time: ${duration}ms`);
  console.log('LCP Entry:', JSON.stringify(lcp, null, 2));

  // Find image requests
  const imageReqs = requests.filter(r => r.mimeType?.startsWith('image/') || r.url.includes('_next/image'));
  console.log('\nImage Network Requests:');
  imageReqs.forEach(img => {
    console.log(` - [${img.mimeType}] ${img.size} bytes: ${img.url}`);
  });

  await browser.close();
}

diagnose().catch(console.error);
