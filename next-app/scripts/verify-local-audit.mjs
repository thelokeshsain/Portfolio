import http from 'http';
import { spawn } from 'child_process';
import puppeteer from 'puppeteer';

const PORT = 3009;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const VIEWPORTS = [
  280, 320, 344, 360, 375, 390, 414, 430, 480, 540, 600,
  640, 768, 820, 912, 1024, 1180, 1280, 1366, 1440, 1600,
  1920, 2560, 3440
];

function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      http.get(url, (res) => {
        if (res.statusCode < 500) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          reject(new Error(`Server at ${url} did not respond within ${timeoutMs}ms`));
        }
      });
    }, 400);
  });
}

async function runLocalAudit() {
  console.log(`Starting local server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    shell: true,
    stdio: 'ignore'
  });

  try {
    await waitForServer(BASE_URL);
    console.log(`Local server is ready at ${BASE_URL}`);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    // 1. Audit OpenAI Logo
    console.log('\n--- 1. AUDITING OPENAI LOGO ---');
    const openaiAssets = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img[src*="openai.svg"]'));
      const results = [];
      for (const img of imgs) {
        const rect = img.getBoundingClientRect();
        // Fetch svg text to check fill color
        let fill = 'unknown';
        try {
          const res = await fetch(img.src);
          const text = await res.text();
          fill = text.includes('fill="#FFFFFF"') ? '#FFFFFF (white)' : 'not white';
        } catch (e) {
          fill = e.message;
        }
        results.push({
          src: img.src,
          width: rect.width,
          height: rect.height,
          fill,
          visible: rect.width > 0 && rect.height > 0,
        });
      }
      return results;
    });
    console.log(JSON.stringify(openaiAssets, null, 2));

    // 2. Audit 4 Social Accounts
    console.log('\n--- 2. AUDITING 4 SOCIAL ACCOUNTS ---');
    const socialLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="github.com"], a[href*="linkedin.com"], a[href*="instagram.com"], a[href*="x.com"]'));
      return links.map(a => ({
        href: a.href,
        text: a.innerText.trim(),
        ariaLabel: a.getAttribute('aria-label'),
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel'),
        section: a.closest('header, footer, section')?.id || a.closest('footer')?.tagName || 'other',
      }));
    });
    console.log(`Total social links found: ${socialLinks.length}`);
    console.log(JSON.stringify(socialLinks, null, 2));

    // Verify all 4 required accounts exist
    const hrefs = socialLinks.map(s => s.href);
    const hasGithub = hrefs.some(h => h.includes('github.com/thelokeshsain'));
    const hasLinkedIn = hrefs.some(h => h.includes('linkedin.com/in/thelokeshsain'));
    const hasInstagram = hrefs.some(h => h.includes('instagram.com/thelokeshsain'));
    const hasX = hrefs.some(h => h.includes('x.com/thelokeshsain'));

    console.log('\nSocial Presence Check:');
    console.log(`- GitHub (https://github.com/thelokeshsain): ${hasGithub ? 'PASS' : 'FAIL'}`);
    console.log(`- LinkedIn (https://www.linkedin.com/in/thelokeshsain/): ${hasLinkedIn ? 'PASS' : 'FAIL'}`);
    console.log(`- Instagram (https://www.instagram.com/thelokeshsain/): ${hasInstagram ? 'PASS' : 'FAIL'}`);
    console.log(`- X (https://x.com/thelokeshsain): ${hasX ? 'PASS' : 'FAIL'}`);

    if (!hasGithub || !hasLinkedIn || !hasInstagram || !hasX) {
      throw new Error('Not all 4 social accounts were found!');
    }

    // 3. Viewport Sweep
    console.log('\n--- 3. 24-VIEWPORT RESPONSIVE AUDIT ---');
    const viewportFailures = [];
    for (const w of VIEWPORTS) {
      await page.setViewport({ width: w, height: 900 });
      await new Promise(r => setTimeout(r, 60));

      const report = await page.evaluate((width) => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const bodyW = document.body.scrollWidth;
        const effectiveW = Math.max(scrollW, bodyW);
        const overflow = effectiveW > docW + 1;

        // Nav elements
        const logo = document.querySelector('.nav-logo');
        const resumeBtn = document.querySelector('.resume-btn');
        const hamburger = document.querySelector('.hamburger');

        let navCollision = false;
        if (logo) {
          const logoRect = logo.getBoundingClientRect();
          const rightEl = (hamburger && window.getComputedStyle(hamburger).display !== 'none')
            ? hamburger
            : resumeBtn;
          if (rightEl && window.getComputedStyle(rightEl).display !== 'none') {
            const rightRect = rightEl.getBoundingClientRect();
            if (logoRect.right > rightRect.left - 2) {
              navCollision = true;
            }
          }
        }

        return {
          width,
          docW,
          effectiveW,
          overflow,
          overflowPx: overflow ? effectiveW - docW : 0,
          navCollision
        };
      }, w);

      console.log(`[${w}px] Doc: ${report.docW} | Scroll: ${report.effectiveW} | Overflow: ${report.overflow ? `+${report.overflowPx}px` : 'NONE'} | Nav Collision: ${report.navCollision}`);
      if (report.overflow || report.navCollision) {
        viewportFailures.push(report);
      }
    }

    await browser.close();

    if (viewportFailures.length > 0) {
      console.error('\nFAILURES IN VIEWPORT SWEEP:', viewportFailures);
      process.exit(1);
    } else {
      console.log('\nALL 24 VIEWPORTS PASSED WITH ZERO OVERFLOW AND ZERO NAVBAR COLLISIONS!');
    }

  } finally {
    server.kill();
  }
}

runLocalAudit().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});
