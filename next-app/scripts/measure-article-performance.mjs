import puppeteer from "puppeteer";

const TARGET_URL = "https://lokeshsain.vercel.app/blog/infosys-tcs-wipro-green-card-perm-suspension";

async function measurePage(url, deviceType = "desktop", throttled = false) {
  console.log(`\n--- Measuring ${deviceType.toUpperCase()} (Throttled: ${throttled}) on ${url} ---`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    if (deviceType === "mobile") {
      await page.setViewport({
        width: 390,
        height: 844,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      });
      await page.setUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      );
    } else {
      await page.setViewport({ width: 1440, height: 900 });
    }

    if (throttled) {
      // Simulate 4G / Throttled Mobile
      const client = await page.createCDPSession();
      await client.send("Network.emulateNetworkConditions", {
        offline: false,
        downloadThroughput: (4 * 1024 * 1024) / 8, // 4 Mbps
        uploadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
        latency: 100, // 100ms RTT
      });
      await client.send("Emulation.setCPUThrottlingRate", { rate: 4 }); // 4x slowdown
    }

    let transferSize = 0;
    let requestCount = 0;
    page.on("response", (res) => {
      requestCount++;
      const headers = res.headers();
      const len = headers["content-length"] ? parseInt(headers["content-length"], 10) : 0;
      transferSize += len;
    });

    const startNav = Date.now();
    const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
    const totalDuration = Date.now() - startNav;

    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fcp = 0;
        let lcp = 0;
        let cls = 0;

        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
              fcp = entry.startTime;
            }
            if (entry.entryType === "largest-contentful-paint") {
              lcp = entry.startTime;
            }
            if (entry.entryType === "layout-shift" && !entry.hadRecentInput) {
              cls += entry.value;
            }
          }
        });

        observer.observe({
          type: "paint",
          buffered: true,
        });
        observer.observe({
          type: "largest-contentful-paint",
          buffered: true,
        });
        observer.observe({
          type: "layout-shift",
          buffered: true,
        });

        setTimeout(() => {
          const navEntries = performance.getEntriesByType("navigation");
          const nav = navEntries.length > 0 ? navEntries[0] : null;
          const ttfb = nav ? nav.responseStart - nav.requestStart : 0;
          const domContentLoaded = nav ? nav.domContentLoadedEventEnd - nav.startTime : 0;
          const loadComplete = nav ? nav.loadEventEnd - nav.startTime : 0;

          resolve({
            ttfb,
            fcp,
            lcp,
            cls,
            domContentLoaded,
            loadComplete,
          });
        }, 1500);
      });
    });

    console.log(`Status Code: ${response.status()}`);
    console.log(`TTFB: ${metrics.ttfb.toFixed(1)} ms`);
    console.log(`FCP: ${metrics.fcp.toFixed(1)} ms`);
    console.log(`LCP: ${metrics.lcp.toFixed(1)} ms`);
    console.log(`CLS: ${metrics.cls.toFixed(4)}`);
    console.log(`DOM Content Loaded: ${metrics.domContentLoaded.toFixed(1)} ms`);
    console.log(`Load Complete: ${metrics.loadComplete.toFixed(1)} ms`);
    console.log(`Total Requests: ${requestCount}`);
    console.log(`Total Transferred Size (reported): ${(transferSize / 1024).toFixed(1)} KB`);
    console.log(`Full Page Time: ${totalDuration} ms`);

    return { ...metrics, requestCount, transferSize, status: response.status() };
  } finally {
    await browser.close();
  }
}

async function run() {
  console.log("================================================================");
  console.log(" INITIAL PERFORMANCE DIAGNOSTICS — LIVE PRODUCTION ARTICLE ROUTE");
  console.log(" URL: " + TARGET_URL);
  console.log("================================================================");

  // 1. Desktop Cold
  await measurePage(TARGET_URL, "desktop", false);

  // 2. Mobile 4G Throttled
  await measurePage(TARGET_URL, "mobile", true);
}

run().catch(console.error);
