async function test() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  const brandMatches = html.match(/src="\/icons\/brands\/[^"]+"/g) || [];
  console.log(`Rendered Brand Icons in SSR HTML: ${brandMatches.length}`);
  console.log([...new Set(brandMatches)]);

  // Verify key brands are all present
  const required = ['javascript', 'react', 'nodejs', 'python', 'mysql', 'mongodb', 'html5', 'css3', 'git', 'vscode', 'openai', 'gemini', 'github', 'linkedin', 'android', 'java'];
  const missing = required.filter(brand => !html.includes(`/icons/brands/${brand}.svg`));
  if (missing.length > 0) {
    console.warn(`Missing brand icons:`, missing);
  } else {
    console.log(`ALL 16 required official brand logos are rendered!`);
  }
}

test();
