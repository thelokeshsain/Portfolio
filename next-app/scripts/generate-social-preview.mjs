import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Generate 1200x630 social_preview.webp for Midnight Blueprint
 */

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="ogGlow" cx="20%" cy="25%" r="60%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.18"/>
      <stop offset="50%" stop-color="#0F172A" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#05070A" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="65%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#38BDF8"/>
    </linearGradient>
  </defs>

  <!-- Deep Midnight Canvas -->
  <rect width="1200" height="630" fill="#05070A"/>
  <rect width="1200" height="630" fill="url(#ogGlow)"/>

  <!-- Subtle Blueprint Grid Pattern -->
  <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
    <line x1="80" y1="0" x2="80" y2="630"/>
    <line x1="1120" y1="0" x2="1120" y2="630"/>
    <line x1="0" y1="80" x2="1200" y2="80"/>
    <line x1="0" y1="550" x2="1200" y2="550"/>
  </g>

  <!-- Border Card -->
  <rect x="80" y="80" width="1040" height="470" rx="24" fill="#0B0F17" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>

  <!-- Left Content -->
  <g transform="translate(140, 150)">
    <!-- Available Badge -->
    <rect width="230" height="34" rx="17" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.25)" stroke-width="1"/>
    <circle cx="20" cy="17" r="5" fill="#10B981"/>
    <text x="36" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#34D399">Available for opportunities</text>

    <!-- Main Title -->
    <text x="0" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="url(#titleGrad)" letter-spacing="-1.5">Lokesh Sain</text>
    
    <!-- Subtitle / Role -->
    <text x="0" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#E2E8F0" letter-spacing="-0.5">Software Engineer</text>
    <text x="0" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">React.js · Node.js · LLM API Integration · Full-Stack</text>
    
    <!-- Location & Experience -->
    <text x="0" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500" fill="#64748B">Jaipur, Rajasthan, India  •  3Handshake Techsoft  •  MCA (CGPA 8.29)</text>

    <!-- Bottom URL Pill -->
    <g transform="translate(0, 275)">
      <rect width="250" height="38" rx="19" fill="#FFFFFF"/>
      <text x="32" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#090D16">lokeshsain.vercel.app</text>
    </g>
  </g>

  <!-- Right Visual Monogram -->
  <g transform="translate(860, 215)">
    <rect width="200" height="200" rx="48" fill="#05070A" stroke="rgba(56,189,248,0.25)" stroke-width="2"/>
    <text x="100" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="88" font-weight="900" fill="#F8FAFC" text-anchor="middle" letter-spacing="-4">LS</text>
    <circle cx="165" cy="55" r="12" fill="#38BDF8"/>
  </g>
</svg>`;

async function main() {
  const dest = path.resolve('public/images/social_preview.webp');
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .webp({ quality: 90 })
    .toFile(dest);
  console.log(`Generated Midnight Blueprint social_preview.webp (1200x630)`);
}

main().catch(console.error);
