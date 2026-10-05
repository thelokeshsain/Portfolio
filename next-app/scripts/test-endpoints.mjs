async function test() {
  const resImage = await fetch('http://localhost:3000/_next/image?url=%2Fimages%2Fhero_laptop_mockup.webp&w=828&q=75');
  console.log('Hero image optimize status:', resImage.status, resImage.headers.get('content-type'), 'bytes:', (await resImage.arrayBuffer()).byteLength);

  const resHeroApi = await fetch('http://localhost:3000/api/hero/image', { redirect: 'manual' });
  console.log('Hero API status:', resHeroApi.status, 'Location:', resHeroApi.headers.get('location'));

  const resPortfolio = await fetch('http://localhost:3000/api/portfolio');
  const portData = await resPortfolio.json();
  console.log('Portfolio hero.description:', portData.hero?.description);
  console.log('Portfolio hero.image:', portData.hero?.image);
  console.log('Portfolio about[0]:', portData.about?.[0]);
  console.log('Portfolio experience:', portData.experience?.map(e => `${e.role} at ${e.company}`));

  const resHtml = await fetch('http://localhost:3000/');
  const html = await resHtml.text();
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  console.log('\nHTML Title:', titleMatch ? titleMatch[1] : 'none');
  const descMatch = html.match(/<meta name="description" content="(.*?)"/);
  console.log('HTML Description:', descMatch ? descMatch[1] : 'none');
  
  const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
  console.log('OG Title:', ogTitleMatch ? ogTitleMatch[1] : 'none');
  const ogDescMatch = html.match(/<meta property="og:description" content="(.*?)"/);
  console.log('OG Description:', ogDescMatch ? ogDescMatch[1] : 'none');
  const ogSiteName = html.match(/<meta property="og:site_name" content="(.*?)"/);
  console.log('OG Site Name:', ogSiteName ? ogSiteName[1] : 'none');

  console.log('\nHTML total 3Handshake occurrences:', (html.match(/3Handshake/gi) || []).length);
  const matches = [...html.matchAll(/(.{0,40}3Handshake.{0,50})/gi)];
  matches.forEach((m, i) => console.log(`  Match ${i + 1}: ${m[1].trim()}`));
}
test().catch(console.error);
