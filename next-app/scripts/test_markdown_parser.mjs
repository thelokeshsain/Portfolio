import assert from "assert";
import { parseMarkdown, parseInline, isSafeUrl, stripRawHtml } from "../src/lib/ai/markdownParser.js";

const PASS = "  [PASS]";
const FAIL = "  [FAIL]";

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`${PASS} ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`${FAIL} ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

console.log("===============================================================");
console.log("RUNNING MARKDOWN AST PARSER & SAFETY TEST SUITE");
console.log("===============================================================\n");

// 1. Bold text parsing
runTest("Parses bold formatting (**text** and __text__)", () => {
  const inline = parseInline("Hello **world** and __there__");
  assert.strictEqual(inline.length, 4);
  assert.strictEqual(inline[0].value, "Hello ");
  assert.strictEqual(inline[1].type, "bold");
  assert.strictEqual(inline[1].children[0].value, "world");
  assert.strictEqual(inline[2].value, " and ");
  assert.strictEqual(inline[3].type, "bold");
  assert.strictEqual(inline[3].children[0].value, "there");
});

// 2. Unordered and ordered lists
runTest("Parses unordered lists (- item and * item)", () => {
  const md = "- **Frontend** - React.js\n- **Backend** - Node.js\n* **Database** - MongoDB";
  const ast = parseMarkdown(md);
  assert.strictEqual(ast.length, 1);
  assert.strictEqual(ast[0].type, "ul");
  assert.strictEqual(ast[0].items.length, 3);
  // Check first item has bold Frontend
  assert.strictEqual(ast[0].items[0][0].type, "bold");
  assert.strictEqual(ast[0].items[0][0].children[0].value, "Frontend");
});

runTest("Parses ordered lists (1. first, 2. second)", () => {
  const md = "1. First step\n2. Second step\n3. Third step";
  const ast = parseMarkdown(md);
  assert.strictEqual(ast.length, 1);
  assert.strictEqual(ast[0].type, "ol");
  assert.strictEqual(ast[0].items.length, 3);
});

// 3. Links and autolinks
runTest("Parses standard markdown links [text](url)", () => {
  const inline = parseInline("Visit [Portfolio](https://lokeshsain.vercel.app/) today");
  assert.strictEqual(inline.length, 3);
  assert.strictEqual(inline[1].type, "link");
  assert.strictEqual(inline[1].href, "https://lokeshsain.vercel.app/");
  assert.strictEqual(inline[1].isSafe, true);
  assert.strictEqual(inline[1].children[0].value, "Portfolio");
});

runTest("Normalizes angle-bracket URLs (<https://...>) without displaying angle brackets", () => {
  const inline = parseInline("See his portfolio at <https://lokeshsain.vercel.app/>.");
  assert.strictEqual(inline.length, 3);
  assert.strictEqual(inline[0].value, "See his portfolio at ");
  assert.strictEqual(inline[1].type, "link");
  assert.strictEqual(inline[1].href, "https://lokeshsain.vercel.app/");
  assert.strictEqual(inline[1].isSafe, true);
  assert.strictEqual(inline[1].children[0].value, "https://lokeshsain.vercel.app/");
  assert.strictEqual(inline[2].value, ".");
});

runTest("Detects bare URLs (https://...)", () => {
  const inline = parseInline("Check https://github.com/thelokeshsain for code");
  assert.strictEqual(inline[1].type, "link");
  assert.strictEqual(inline[1].href, "https://github.com/thelokeshsain");
  assert.strictEqual(inline[1].isSafe, true);
});

// 4. HTML Stripping & Anti-XSS
runTest("Strips malicious HTML tags (<script>, <iframe>, <img onerror>)", () => {
  const dirty = 'Hello <script>alert("xss")</script><iframe src="evil.com"></iframe><img src=x onerror=alert(1)>World';
  const clean = stripRawHtml(dirty);
  assert(!clean.includes("<script>"), "Must strip script");
  assert(!clean.includes("<iframe"), "Must strip iframe");
  assert(!clean.includes("<img"), "Must strip img");
  assert.strictEqual(clean, "Hello World");
});

runTest("Rejects unsafe URL protocols (javascript:, data:, vbscript:)", () => {
  assert.strictEqual(isSafeUrl("javascript:alert(1)"), false);
  assert.strictEqual(isSafeUrl("data:text/html,<script>alert(1)</script>"), false);
  assert.strictEqual(isSafeUrl("vbscript:msgbox(1)"), false);
  assert.strictEqual(isSafeUrl("https://lokeshsain.vercel.app"), true);
  assert.strictEqual(isSafeUrl("http://example.com"), true);
  assert.strictEqual(isSafeUrl("/blog"), true);
  assert.strictEqual(isSafeUrl("#contact"), true);
  assert.strictEqual(isSafeUrl("mailto:contact@example.com"), true);

  const inline = parseInline("[Click here](javascript:alert(1))");
  assert.strictEqual(inline[0].type, "link");
  assert.strictEqual(inline[0].isSafe, false);
  assert.strictEqual(inline[0].href, "#");
});

// 5. Malformed Markdown resilience
runTest("Handles malformed Markdown gracefully without throwing", () => {
  const malformed = "**Unclosed bold and [unclosed link without paren";
  let ast;
  assert.doesNotThrow(() => {
    ast = parseMarkdown(malformed);
  });
  assert(ast.length > 0);
  assert.strictEqual(ast[0].type, "paragraph");
});

// 6. Complete Real Screenshot Payload Test
runTest("Parses the exact Ask Lokesh AI screenshot response structure", () => {
  const realPromptResponse = `Lokesh's core technical stack centers on the **MERN** architecture:

- **Frontend** – React.js (with Hooks, Context API, Tailwind CSS, responsive design), HTML5, CSS3, JavaScript
- **Backend** – Node.js, Express.js, building RESTful APIs and integrating external services
- **Database** – MongoDB
- **Tools & Workflow** – Git/GitHub, VS Code, Postman, Chrome DevTools, Android Studio (for Android projects)

He builds scalable, performant web applications, focusing on component-driven design, code-splitting, lazy loading, and state optimization to improve Core Web Vitals. For more details, see his portfolio at <https://lokeshsain.vercel.app/>.`;

  const ast = parseMarkdown(realPromptResponse);
  assert.strictEqual(ast.length, 3, "Must have 3 blocks: paragraph, ul list, paragraph");
  assert.strictEqual(ast[0].type, "paragraph");
  assert.strictEqual(ast[1].type, "ul");
  assert.strictEqual(ast[1].items.length, 4);
  assert.strictEqual(ast[2].type, "paragraph");

  // Check last paragraph contains normalized link
  const lastParaLinks = ast[2].children.filter((c) => c.type === "link");
  assert.strictEqual(lastParaLinks.length, 1);
  assert.strictEqual(lastParaLinks[0].href, "https://lokeshsain.vercel.app/");
  assert.strictEqual(lastParaLinks[0].isSafe, true);
});

console.log("\n===============================================================");
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log("===============================================================\n");

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
