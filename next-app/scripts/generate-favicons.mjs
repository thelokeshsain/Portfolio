import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Generate Midnight Blueprint Favicon and App Icon System
 * 
 * Features:
 * - Deep #05070A background with rounded squircle
 * - High-contrast bold white 'LS' geometric monogram
 * - Vibrant electric cyan '#38BDF8' active status dot
 * - Extreme legibility at 16x16 and 32x32
 */

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="ambientGlow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="#0F172A" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#05070A" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
  </defs>

  <!-- Squircle Obsidian Canvas -->
  <rect width="512" height="512" rx="128" fill="#05070A"/>
  <rect width="512" height="512" rx="128" fill="url(#ambientGlow)"/>
  <rect x="8" y="8" width="496" height="496" rx="122" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="8"/>

  <!-- Bold Geometric Monogram 'LS' -->
  <g fill="#F8FAFC">
    <!-- Letter L -->
    <path d="M 112 144 C 112 133 121 124 132 124 L 176 124 C 187 124 196 133 196 144 L 196 320 L 254 320 C 265 320 274 329 274 340 L 274 368 C 274 379 265 388 254 388 L 132 388 C 121 388 112 379 112 368 Z" />

    <!-- Letter S -->
    <path d="M 314 200 C 314 178 332 160 354 160 L 388 160 C 400 160 408 152 408 140 C 408 128 400 120 388 120 L 324 120 C 313 120 304 111 304 100 L 304 76 C 304 65 313 56 324 56 L 396 56 C 444 56 476 88 476 136 C 476 182 444 208 396 220 L 362 228 C 342 233 334 242 334 256 C 334 270 344 280 366 280 L 436 280 C 447 280 456 289 456 300 L 456 324 C 456 335 447 344 436 344 L 358 344 C 308 344 274 310 274 260 C 274 212 306 186 354 174 L 388 166 C 394 164 398 160 398 154 C 398 148 394 144 388 144 L 334 144 C 323 144 314 153 314 164 Z" transform="translate(-10, 44)" />
  </g>

  <!-- Cyan Accent Dot -->
  <circle cx="438" cy="130" r="28" fill="url(#cyanGrad)"/>
</svg>`;

async function main() {
  const publicDir = path.resolve('public');
  const iconsDir = path.join(publicDir, 'icons');

  // Save SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
  console.log('Saved public/favicon.svg and public/icon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // Generate PNGs
  const targets = [
    { file: path.join(publicDir, 'favicon-16x16.png'), size: 16 },
    { file: path.join(publicDir, 'favicon-32x32.png'), size: 32 },
    { file: path.join(publicDir, 'apple-touch-icon.png'), size: 180 },
    { file: path.join(iconsDir, 'icon-192.png'), size: 192 },
    { file: path.join(iconsDir, 'icon-512.png'), size: 512 },
    { file: path.join(publicDir, 'images', 'email-logo.png'), size: 120 },
  ];

  for (const t of targets) {
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png()
      .toFile(t.file);
    console.log(`Generated ${path.relative(process.cwd(), t.file)} (${t.size}x${t.size})`);
  }

  // Generate ICO (32x32 PNG renamed to ico or multi-size)
  const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32);
  console.log('Generated public/favicon.ico');
}

main().catch(console.error);
