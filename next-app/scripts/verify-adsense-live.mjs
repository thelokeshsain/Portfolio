async function poll() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('https://lokeshsain.vercel.app/', { 
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } 
      });
      const html = await res.text();
      const hasAdText = html.includes('Advertisement');
      const hasScript = html.includes('pagead2.googlesyndication.com');
      const hasDataNscript = html.includes('data-nscript');
      
      const scriptMatch = html.match(/<script[^>]*pagead2[^>]*>/i);
      console.log(`[Attempt ${i+1}] hasAdText: ${hasAdText} | hasScript: ${hasScript} | tag: ${scriptMatch ? scriptMatch[0] : 'None'}`);

      if (!hasAdText && hasScript && !hasDataNscript) {
        console.log('\n>>> LIVE PRODUCTION CONFIRMED: Auto ads canonical script present, data-nscript eliminated, empty ad frame eliminated! <<<');
        return true;
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
    await new Promise(r => setTimeout(r, 4000));
  }
  return false;
}

poll();
