import fs from 'node:fs';
import path from 'node:path';

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function walk(dir, fileList = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walk(p, fileList);
      }
    } else if (/\.(jsx?|tsx?|css)$/.test(f)) {
      fileList.push(p);
    }
  }
  return fileList;
}

const files = walk('src');
console.log(`Auditing ${files.length} source files for emojis and deprecated icon patterns...\n`);

let foundIssues = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check emojis
    if (emojiRegex.test(line)) {
      console.warn(`[EMOJI FOUND] ${file}:${idx + 1}: ${line.trim()}`);
      foundIssues++;
    }

    // Check suspicious old custom icon helpers
    if (/const (GHIcon|LIIcon|MailIcon)\b/.test(line)) {
      console.warn(`[DEPRECATED ICON HELPER] ${file}:${idx + 1}: ${line.trim()}`);
      foundIssues++;
    }
  });
}

console.log(`\nAudit completed. Total issues found: ${foundIssues}`);
