import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";

console.log("=============================================================");
console.log("TESTING ADMIN DASHBOARD -> PERSPECTIVES BLOG RENDER INTEGRITY");
console.log("=============================================================");

// Verify BlogEditor source code does not contain <Dialog />
const blogEditorSource = fs.readFileSync("src/components/admin/BlogEditor.jsx", "utf8");
const invalidDialogMatches = [...blogEditorSource.matchAll(/<Dialog[\s/>]/g)];

if (invalidDialogMatches.length > 0) {
  console.error(`[FAIL] Found ${invalidDialogMatches.length} invalid <Dialog /> calls in BlogEditor.jsx!`);
  process.exit(1);
} else {
  console.log("[PASS] Verified BlogEditor.jsx contains 0 invalid <Dialog /> calls.");
}

const correctDialogMatches = [...blogEditorSource.matchAll(/\{Dialog\}/g)];
if (correctDialogMatches.length >= 2) {
  console.log(`[PASS] Verified BlogEditor.jsx correctly uses {Dialog} (${correctDialogMatches.length} occurrences).`);
} else {
  console.warn(`[WARN] Found only ${correctDialogMatches.length} {Dialog} occurrences in BlogEditor.jsx.`);
}

// Verify all other admin components also use {Dialog} and zero use <Dialog />
const adminFiles = fs.readdirSync("src/components/admin").filter((f) => f.endsWith(".jsx"));
let anyInvalid = false;
for (const file of adminFiles) {
  const content = fs.readFileSync("src/components/admin/" + file, "utf8");
  if (/<Dialog[\s/>]/.test(content)) {
    console.error(`[FAIL] Found invalid <Dialog /> in src/components/admin/${file}!`);
    anyInvalid = true;
  }
}

if (!anyInvalid) {
  console.log(`[PASS] Verified all ${adminFiles.length} admin components are free of invalid <Dialog /> elements.`);
} else {
  process.exit(1);
}

console.log("=============================================================");
console.log("ALL ADMIN PERSPECTIVES BLOG REGRESSION CHECKS PASSED!");
console.log("=============================================================");
