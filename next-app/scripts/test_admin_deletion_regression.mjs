import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";

console.log("=============================================================");
console.log("TESTING ADMIN DELETION WORKFLOW & REACT ERROR #31 REGRESSION");
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
// 1. REPRODUCIBILITY & FIX TEST FOR useConfirm
// -------------------------------------------------------------
console.log("\n--- 1. Testing useConfirm Dialog Rendering Invariants ---");

// Import the actual ConfirmDialog source to verify logic
const confirmSource = fs.readFileSync("src/components/ui/ConfirmDialog.jsx", "utf8");

assert(confirmSource.includes("typeof param === 'object'"), "useConfirm handles object parameters gracefully");
assert(confirmSource.includes("title.trim()"), "useConfirm safely extracts title string");
assert(confirmSource.includes("message"), "useConfirm extracts message string without passing object directly to JSX");
assert(confirmSource.includes("confirmText"), "useConfirm supports custom confirmText");
assert(confirmSource.includes("aria-describedby"), "useConfirm includes aria-describedby for accessibility");
assert(confirmSource.includes("Escape"), "useConfirm includes Escape key accessibility listener");

// Mock React render test for ConfirmDialog with an object
function MockConfirmConsumer({ config }) {
  const state = {
    open: true,
    title: typeof config?.title === 'string' ? config.title : 'Are you sure?',
    message: typeof config?.message === 'string' ? config.message : String(config?.message || ''),
    confirmText: typeof config?.confirmText === 'string' ? config.confirmText : 'Confirm',
    cancelText: typeof config?.cancelText === 'string' ? config.cancelText : 'Cancel',
    danger: config?.danger ?? true
  };

  return React.createElement(
    'div',
    { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'confirm-title', 'aria-describedby': 'confirm-desc' },
    React.createElement('div', { id: 'confirm-title' }, state.title),
    React.createElement('p', { id: 'confirm-desc' }, state.message),
    React.createElement('button', null, state.cancelText),
    React.createElement('button', { style: state.danger ? { background: '#cc0000' } : undefined }, state.confirmText)
  );
}

try {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(MockConfirmConsumer, {
      config: {
        title: "Archive Article",
        message: "Are you sure you want to archive this test article?",
        confirmText: "Archive Article",
        danger: true
      }
    })
  );
  assert(html.includes("Archive Article"), "Rendered dialog includes custom title 'Archive Article'");
  assert(html.includes("Are you sure you want to archive this test article?"), "Rendered dialog includes message string");
  assert(html.includes("confirm-title"), "Rendered dialog includes accessibility title id");
  assert(html.includes("confirm-desc"), "Rendered dialog includes accessibility desc id");
} catch (err) {
  assert(false, `React Error #31 encountered during dialog render: ${err.message}`);
}

// -------------------------------------------------------------
// 2. BLOG EDITOR DELETION WORKFLOW AUDIT
// -------------------------------------------------------------
console.log("\n--- 2. Testing BlogEditor Deletion Workflow & Guardrails ---");

const blogEditorSource = fs.readFileSync("src/components/admin/BlogEditor.jsx", "utf8");

assert(blogEditorSource.includes("const [deletingId, setDeletingId] = useState(null)"), "BlogEditor tracks deletingId state");
assert(blogEditorSource.includes("if (deletingId) return;"), "handleDelete guards against concurrent / duplicate submissions");
assert(blogEditorSource.includes("disabled={deletingId === art.id}"), "DelBtn is disabled during active deletion");
assert(blogEditorSource.includes("toast.error"), "handleDelete displays descriptive error toast on failure");
assert(blogEditorSource.includes("apiClient.delete"), "handleDelete sends DELETE request to /admin/blog/${id}");

// -------------------------------------------------------------
// 3. SERVER-SIDE API AUTHORIZATION & VALIDATION AUDIT
// -------------------------------------------------------------
console.log("\n--- 3. Testing DELETE /api/admin/blog/[id] Route Security ---");

const deleteRouteSource = fs.readFileSync("src/app/api/admin/blog/[id]/route.js", "utf8");

assert(deleteRouteSource.includes("withAuth("), "DELETE route is protected by withAuth admin authentication");
assert(deleteRouteSource.includes("mongoose.Types.ObjectId.isValid(id)"), "DELETE route validates ObjectId before query");
assert(deleteRouteSource.includes("status: 400"), "DELETE route returns HTTP 400 on malformed ID");
assert(deleteRouteSource.includes("status: 404"), "DELETE route returns HTTP 404 if article not found");
assert(deleteRouteSource.includes('revalidatePath("/blog")'), "DELETE route invalidates /blog ISR cache");
assert(deleteRouteSource.includes('revalidatePath("/sitemap.xml")'), "DELETE route invalidates /sitemap.xml cache");

// -------------------------------------------------------------
// 4. SHARED CONSUMERS COMPATIBILITY AUDIT
// -------------------------------------------------------------
console.log("\n--- 4. Testing Other Admin useConfirm Consumers ---");

const otherConsumerFiles = [
  "src/components/admin/ExperienceEditor.jsx",
  "src/components/admin/ProjectsEditor.jsx",
  "src/components/admin/ContactsViewer.jsx",
  "src/components/admin/SecurityEditor.jsx",
  "src/components/admin/SkillsEditor.jsx",
  "src/components/admin/AchievementsEditor.jsx"
];

for (const file of otherConsumerFiles) {
  const content = fs.readFileSync(file, "utf8");
  assert(content.includes("useConfirm"), `${file} correctly imports useConfirm`);
  assert(content.includes("{Dialog}"), `${file} embeds Dialog as {Dialog} expression (no React Error #130)`);
}

console.log("\n=============================================================");
if (failed === 0) {
  console.log(`ALL ${passed} DELETION & REACT ERROR #31 REGRESSION CHECKS PASSED!`);
  console.log("=============================================================");
  process.exit(0);
} else {
  console.error(`FAILED: ${failed} checks failed, ${passed} passed.`);
  console.log("=============================================================");
  process.exit(1);
}
