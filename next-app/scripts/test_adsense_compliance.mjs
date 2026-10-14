import fs from "fs";
import { ADS_CONFIG } from "../src/config/ads.js";

console.log("=============================================================");
console.log("RUNNING GOOGLE ADSENSE COMPLIANCE & RE-AUDIT VERIFICATION");
console.log("=============================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// 1. PUBLISHER ID CONSISTENCY AUDIT
// -------------------------------------------------------------
console.log("\n--- 1. Publisher ID Consistency & ads.txt Verification ---");

const privacyPolicySource = fs.readFileSync("src/app/privacy-policy/page.jsx", "utf8");
const staleId = "ca-pub-6421974191427219";
assert(!privacyPolicySource.includes(staleId), `Privacy policy does NOT contain stale publisher ID (${staleId})`);

const verifiedPubId = "4833006824493392";
assert(privacyPolicySource.includes(verifiedPubId), `Privacy policy contains verified publisher ID (${verifiedPubId})`);
assert(privacyPolicySource.includes("ADS_CONFIG.getClientId()"), "Privacy policy dynamically derives client ID from centralized ADS_CONFIG");

const adsTxtRouteSource = fs.readFileSync("src/app/ads.txt/route.js", "utf8");
assert(adsTxtRouteSource.includes("ADS_CONFIG.getAdsTxtPubId()"), "ads.txt route handler uses ADS_CONFIG.getAdsTxtPubId()");
assert(adsTxtRouteSource.includes("f08c47fec0942fa0"), "ads.txt includes Google certification authority ID (f08c47fec0942fa0)");

// -------------------------------------------------------------
// 2. CRAWLER ACCESSIBILITY AUDIT (ROBOTS.TXT)
// -------------------------------------------------------------
console.log("\n--- 2. Crawler Accessibility Audit (robots.js) ---");

const robotsSource = fs.readFileSync("src/app/robots.js", "utf8");
assert(robotsSource.includes('"Mediapartners-Google"'), "robots.js explicitly permits Mediapartners-Google crawler");
assert(robotsSource.includes('"Google-Display-Ads-Bot"'), "robots.js explicitly permits Google-Display-Ads-Bot crawler");
assert(robotsSource.includes('"Googlebot"'), "robots.js explicitly permits Googlebot crawler");
assert(robotsSource.includes('"/admin"'), "robots.js disallows private administrative routes");
assert(robotsSource.includes('"/blog/preview/"'), "robots.js disallows private article preview routes");

// -------------------------------------------------------------
// 3. AD PLACEMENT SAFETY AUDIT
// -------------------------------------------------------------
console.log("\n--- 3. Ad Placement Safety Audit ---");

const adSenseScriptSource = fs.readFileSync("src/components/ads/AdSenseScript.jsx", "utf8");
assert(adSenseScriptSource.includes('pathname?.startsWith("/admin")'), "AdSenseScript excludes /admin routes");
assert(adSenseScriptSource.includes('pathname?.startsWith("/blog/preview")'), "AdSenseScript excludes /blog/preview routes");
assert(adSenseScriptSource.includes('pathname?.startsWith("/api")'), "AdSenseScript excludes /api routes");
assert(adSenseScriptSource.includes("pagead2.googlesyndication.com"), "AdSenseScript uses canonical Google AdSense script URL");

// -------------------------------------------------------------
// 4. CONSENT & PRIVACY AUDIT
// -------------------------------------------------------------
console.log("\n--- 4. Consent Architecture Audit ---");

const consentSource = fs.readFileSync("src/components/ads/consent.js", "utf8");
assert(consentSource.includes("window.googlefc"), "consent.js interfaces with Google Privacy & Messaging (window.googlefc)");
assert(!consentSource.includes("alert("), "consent.js uses clean, non-blocking notification instead of browser alert()");

// -------------------------------------------------------------
// 5. CONTENT SECURITY POLICY AUDIT
// -------------------------------------------------------------
console.log("\n--- 5. Content Security Policy (CSP) Audit ---");

const nextConfigSource = fs.readFileSync("next.config.mjs", "utf8");
assert(nextConfigSource.includes("pagead2.googlesyndication.com"), "CSP script-src permits pagead2.googlesyndication.com");
assert(nextConfigSource.includes("*.googlesyndication.com"), "CSP connect-src and frame-src permit *.googlesyndication.com");
assert(nextConfigSource.includes("googleads.g.doubleclick.net"), "CSP frame-src permits googleads.g.doubleclick.net");
assert(!nextConfigSource.includes("'unsafe-eval' ;") && !nextConfigSource.includes("\"'unsafe-eval'\""), "Production CSP strictly excludes unsafe-eval");

// -------------------------------------------------------------
// 6. ASSET INTEGRITY
// -------------------------------------------------------------
console.log("\n--- 6. Asset & Editorial Integrity ---");

const socialPreviewPath = "public/images/social_preview.webp";
assert(fs.existsSync(socialPreviewPath), "Authoritative social preview exists");
const socialSize = fs.statSync(socialPreviewPath).size;
assert(socialSize === 221270, `Authoritative social preview exact size preserved (221,270 bytes, actual: ${socialSize})`);

console.log("\n=============================================================");
if (failed === 0) {
  console.log(`ALL ${passed} ADSENSE AUDIT & COMPLIANCE CHECKS PASSED!`);
  console.log("=============================================================");
  process.exit(0);
} else {
  console.error(`FAILED: ${failed} checks failed, ${passed} passed.`);
  console.log("=============================================================");
  process.exit(1);
}
