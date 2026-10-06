import crypto from 'node:crypto';

async function main() {
  console.log('=== LIVE PRODUCTION SOCIAL PREVIEW VERIFICATION ===\n');

  // 1. Image Asset Check
  const imgUrl = 'https://lokeshsain.vercel.app/images/social_preview.webp';
  const resImg = await fetch(imgUrl, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
  const buf = Buffer.from(await resImg.arrayBuffer());
  const hash = crypto.createHash('sha256').update(buf).digest('hex');

  console.log('1. Image URL:', imgUrl);
  console.log('   HTTP Status:', resImg.status);
  console.log('   Content-Type:', resImg.headers.get('content-type'));
  console.log('   Content-Length:', resImg.headers.get('content-length'));
  console.log('   Actual Bytes:', buf.length);
  console.log('   SHA-256:', hash);

  const EXPECTED_HASH = 'a2fbc162592d69e1449d2f64cc782a38c1cd8e8587b2a4ecbf992bc7073d8398';
  const EXPECTED_BYTES = 221270;
  console.log('   Match Authoritative New Asset?:', hash === EXPECTED_HASH && buf.length === EXPECTED_BYTES);

  // 2. HTML Meta Tags Check
  const resHtml = await fetch('https://lokeshsain.vercel.app/', { headers: { 'Cache-Control': 'no-cache' } });
  const html = await resHtml.text();
  const ogImg = html.match(/<meta property="og:image" content="([^"]+)"/);
  const ogWidth = html.match(/<meta property="og:image:width" content="([^"]+)"/);
  const ogHeight = html.match(/<meta property="og:image:height" content="([^"]+)"/);
  const twImg = html.match(/<meta name="twitter:image" content="([^"]+)"/);

  console.log('\n2. Live HTML Meta Tags:');
  console.log('   og:image:', ogImg ? ogImg[1] : 'NOT FOUND');
  console.log('   og:image:width:', ogWidth ? ogWidth[1] : 'NOT FOUND');
  console.log('   og:image:height:', ogHeight ? ogHeight[1] : 'NOT FOUND');
  console.log('   twitter:image:', twImg ? twImg[1] : 'NOT FOUND');

  if (hash === EXPECTED_HASH && buf.length === EXPECTED_BYTES) {
    console.log('\n>>> LIVE PRODUCTION VERIFICATION PASSED: Authoritative NEW social preview active on live production! <<<');
  } else {
    console.error('\n>>> LIVE PRODUCTION VERIFICATION FAILED: Mismatch! <<<');
  }
}

main().catch(console.error);
