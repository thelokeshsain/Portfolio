import puppeteer from 'puppeteer';

const URL = 'https://lokeshsain.vercel.app/blog/infosys-tcs-wipro-green-card-perm-suspension';

async function testWaterfall() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  const reqs = new Map();
  client.on('Network.requestWillBeSent', (e) => {
    reqs.set(e.requestId, {
      url: e.request.url,
      method: e.request.method,
      type: e.type,
      startTime: e.timestamp,
    });
  });

  client.on('Network.responseReceived', (e) => {
    const item = reqs.get(e.requestId);
    if (item) {
      item.status = e.response.status;
      item.mimeType = e.response.mimeType;
      item.timing = e.response.timing;
      item.headers = e.response.headers;
    }
  });

  client.on('Network.loadingFinished', (e) => {
    const item = reqs.get(e.requestId);
    if (item) {
      item.endTime = e.timestamp;
      item.encodedDataLength = e.encodedDataLength;
      item.durationMs = Math.round((e.timestamp - item.startTime) * 1000);
    }
  });

  await page.goto(URL, { waitUntil: 'networkidle2' });

  const summary = Array.from(reqs.values()).map(r => ({
    url: r.url.length > 80 ? r.url.slice(0, 80) + '...' : r.url,
    type: r.type,
    status: r.status,
    sizeKb: r.encodedDataLength ? (r.encodedDataLength / 1024).toFixed(1) : '?',
    durationMs: r.durationMs,
  }));

  console.log('--- ALL NETWORK REQUESTS ---');
  console.table(summary);

  await browser.close();
}

testWaterfall().catch(console.error);
