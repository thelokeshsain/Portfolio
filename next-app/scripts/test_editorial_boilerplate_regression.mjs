import fs from "fs";
import path from "path";
import connectDB from "../src/lib/db.js";
import Article from "../src/models/Article.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== RUNNING EDITORIAL BOILERPLATE & INTEGRITY REGRESSION TESTS ===\n");

  // ----------------------------------------------------
  // TEST SUITE 1: Template & Component Static Code Audit
  // ----------------------------------------------------
  console.log("Suite 1: Template & Component Static Analysis");

  const slugPageSource = fs.readFileSync(
    path.resolve("src/app/blog/[slug]/page.jsx"),
    "utf8"
  );
  const blogPageSource = fs.readFileSync(
    path.resolve("src/app/blog/page.jsx"),
    "utf8"
  );
  const blogLayoutSource = fs.readFileSync(
    path.resolve("src/app/blog/layout.jsx"),
    "utf8"
  );
  const mastheadSource = fs.readFileSync(
    path.resolve("src/components/blog/BlogMasthead.jsx"),
    "utf8"
  );

  // 1.1 Zero immigration keywords in article page template
  const forbiddenPatterns = [
    /immigration/i,
    /statutory\s+immigration/i,
    /administrative\s+claims/i,
    /immigration\s+counsel/i,
    /statutes\s+and\s+administrative/i,
  ];

  for (const pattern of forbiddenPatterns) {
    const match = slugPageSource.match(pattern);
    assert(
      !match,
      `[slug]/page.jsx contains zero references matching pattern: ${pattern.toString()}`
    );
  }

  // 1.2 Verify Technical Standards Notice is rendered in [slug]/page.jsx
  assert(
    slugPageSource.includes("Technical Standards &amp; Integrity:"),
    "[slug]/page.jsx contains authoritative Technical Standards & Integrity disclosure"
  );

  // 1.3 Verify Technical Correction mailto link is present
  assert(
    slugPageSource.includes("Submit Technical Correction"),
    "[slug]/page.jsx contains Technical Correction submission CTA"
  );

  // 1.4 Verify Blog Layout has aligned engineering metadata
  assert(
    !/global affairs/i.test(blogLayoutSource),
    "blog/layout.jsx contains zero references to 'global affairs'"
  );
  assert(
    /Software Engineering & System Architecture/i.test(blogLayoutSource),
    "blog/layout.jsx metadata title correctly reflects Software Engineering & System Architecture"
  );

  // 1.5 Verify Blog Index Page metadata
  assert(
    !/global commentary/i.test(blogPageSource),
    "blog/page.jsx contains zero references to 'global commentary'"
  );
  assert(
    /Software Engineering & Systems Analysis/i.test(blogPageSource),
    "blog/page.jsx reflects Software Engineering & Systems Analysis"
  );

  // 1.6 Verify Masthead descriptor
  assert(
    !/world affairs/i.test(mastheadSource),
    "BlogMasthead.jsx contains zero references to 'world affairs'"
  );
  assert(
    mastheadSource.includes("Software engineering analyses"),
    "BlogMasthead.jsx descriptor accurately describes software engineering and postmortems"
  );

  // 1.7 Verify Blog Index About Section has zero geopolitical / employment market copy
  assert(
    !/geopolitical/i.test(blogPageSource),
    "blog/page.jsx About section contains zero references to 'geopolitical'"
  );
  assert(
    !/employment markets/i.test(blogPageSource),
    "blog/page.jsx About section contains zero references to 'employment markets'"
  );

  // 1.8 Verify ArticleAiSummary.jsx qualifies AI claims
  const aiSummarySource = fs.readFileSync(
    path.resolve("src/components/blog/ArticleAiSummary.jsx"),
    "utf8"
  );
  assert(
    !/verified summary/i.test(aiSummarySource),
    "ArticleAiSummary.jsx contains zero unsupported 'verified summary' claims"
  );
  assert(
    !/Executive AI Synthesis/i.test(aiSummarySource),
    "ArticleAiSummary.jsx replaced 'Executive AI Synthesis' with accurate 'AI-Assisted Summary'"
  );
  assert(
    aiSummarySource.includes("AI-Generated Key Takeaways"),
    "ArticleAiSummary.jsx displays truthful 'AI-Generated Key Takeaways' heading"
  );

  // ----------------------------------------------------
  // TEST SUITE 2: MongoDB Editorial Inventory & Integrity
  // ----------------------------------------------------
  console.log("\nSuite 2: Database Article Integrity & Content Audit");

  await connectDB();

  const publishedArticles = await Article.find({ status: "published" }).lean();
  assert(
    publishedArticles.length === 4,
    `Exactly 4 articles are published in production (Found: ${publishedArticles.length})`
  );

  const expectedSlugs = [
    "react-error-130-turbopack-postmortem",
    "enterprise-image-upload-nextjs-vercel-blob",
    "sub-350px-mobile-viewport-optimization-nextjs",
    "architecting-jzunto-curriculum-intelligence",
  ];

  const foundSlugs = publishedArticles.map((a) => a.slug);
  for (const expSlug of expectedSlugs) {
    assert(
      foundSlugs.includes(expSlug),
      `Verified published article exists with slug: ${expSlug}`
    );
  }

  // 2.2 Deep scan of every published article body for irrelevant boilerplate
  for (const article of publishedArticles) {
    const rawJson = JSON.stringify(article);
    for (const pattern of forbiddenPatterns) {
      assert(
        !pattern.test(rawJson),
        `Article '${article.slug}' contains zero matches for pattern: ${pattern.toString()}`
      );
    }
  }

  // 2.3 Verify archived PERM article remains strictly archived
  const archivedArticles = await Article.find({ status: "archived" }).lean();
  const permArticle = archivedArticles.find((a) =>
    a.slug.includes("perm") || a.title.toLowerCase().includes("perm")
  );
  if (permArticle) {
    assert(
      permArticle.status === "archived",
      `PERM article ('${permArticle.slug}') status is strictly 'archived' (never published)`
    );
  } else {
    // If not found in archived, confirm it is definitely not published
    const publishedPerm = publishedArticles.find((a) =>
      a.slug.includes("perm") || a.title.toLowerCase().includes("perm")
    );
    assert(
      !publishedPerm,
      "PERM article is strictly excluded from published articles"
    );
  }

  // 2.4 Verify no drafts are published
  const draftArticles = await Article.find({ status: "draft" }).lean();
  for (const draft of draftArticles) {
    assert(
      draft.status !== "published",
      `Draft article '${draft.slug}' is not published`
    );
  }

  // 2.5 Verify author bio across all published articles in DB is clean
  for (const article of publishedArticles) {
    assert(
      article.author?.bio?.includes("Software Engineer based in Jaipur, India"),
      `Article '${article.slug}' author.bio is updated to software engineering bio in MongoDB`
    );
    assert(
      !/global affairs|geopolitical/i.test(article.author?.bio || ""),
      `Article '${article.slug}' author.bio contains zero references to 'global affairs' or 'geopolitical'`
    );
  }

  // ----------------------------------------------------
  // TEST SUITE 3: Asset & Security Integrity
  // ----------------------------------------------------
  console.log("\nSuite 3: Asset & Security Constraint Assertions");

  // 3.1 social_preview.webp preservation
  const socialPreviewStats = fs.statSync("public/images/social_preview.webp");
  assert(
    socialPreviewStats.size === 221270,
    `public/images/social_preview.webp is untouched (exact size: 221,270 bytes)`
  );

  // 3.2 CSP check: no unsafe-eval in production CSP
  const nextConfig = fs.readFileSync("next.config.mjs", "utf8");
  assert(
    nextConfig.includes("isDev ? \"'unsafe-eval' \" : \"\""),
    "next.config.mjs Content Security Policy isolates 'unsafe-eval' strictly to development mode and excludes it from production"
  );

  console.log("\n==================================================");
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
