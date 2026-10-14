import connectDB from "../src/lib/db.js";
import Article from "../src/models/Article.js";
import fs from "fs";

async function main() {
  await connectDB();
  console.log("Connected to MongoDB.");

  // 1. Create a backup of the current articles
  const currentArticles = await Article.find({ status: "published" }).lean();
  fs.writeFileSync(
    "scripts/articles_backup_before_editorial_qualification.json",
    JSON.stringify(currentArticles, null, 2),
    "utf8"
  );
  console.log(`Backed up ${currentArticles.length} published articles.`);

  // 2. Article 1 updates (Qualify permanent elimination claim)
  const a1 = await Article.findOne({ slug: "react-error-130-turbopack-postmortem" });
  if (a1) {
    a1.content = a1.content.replace(
      "To guarantee that no other administrative component could ever re-introduce this failure pattern, we authored an automated AST/regex regression check in `scripts/test_admin_blog_navigation.mjs`:",
      "To verify that administrative components maintain valid dialog invocation patterns and prevent regressions during local builds and CI, we authored an automated regression check in `scripts/test_admin_deletion_regression.mjs`:"
    );
    await a1.save();
    console.log("Updated Article 1 (React Error #130) with qualified regression scope.");
  }

  // 3. Article 2 updates (Qualify absolute enterprise/zero leakage statements)
  const a2 = await Article.findOne({ slug: "enterprise-image-upload-nextjs-vercel-blob" });
  if (a2) {
    a2.title = "Building a Production-Grade Secure Image Upload Pipeline with Next.js App Router and Vercel Blob";
    a2.content = a2.content.replace(
      "satisfies both developer velocity and enterprise security standards.",
      "satisfies both developer velocity and robust operational security standards within the documented 5MB and format boundaries."
    );
    await a2.save();
    console.log("Updated Article 2 (Image Upload Pipeline) with qualified security descriptors.");
  }

  // 4. Article 3 updates (Qualify Zero-CLS guarantee to verified synthetic test results)
  const a3 = await Article.findOne({ slug: "sub-350px-mobile-viewport-optimization-nextjs" });
  if (a3) {
    a3.title = "Sub-350px Viewport Optimization: Eliminating Horizontal Bleed and Minimizing Layout Shifts in Editorial Next.js";
    a3.content = a3.content.replace(
      "### Fix 4: Preserving Zero CLS with Modern Aspect Ratios\nTo guarantee zero Cumulative Layout Shift when the lead image renders asynchronously, we replaced fixed heights with modern CSS `aspect-ratio`:",
      "### Fix 4: Minimizing Layout Shifts with Modern Aspect Ratios\nTo prevent asynchronous layout shifts (reducing lead image CLS to near-zero in tested synthetic viewports) when the lead image renders asynchronously, we replaced fixed heights with modern CSS `aspect-ratio`:"
    );
    a3.content = a3.content.replace(
      "Following the implementation, we re-ran `scripts/reproduce-blog-mobile.mjs` against the local build. The results confirmed full resolution:",
      "Following the implementation, we re-ran our automated headless viewport test suite against the local build under emulated sub-350px viewports (320px–360px). The results confirmed elimination of horizontal scroll overflow:"
    );
    await a3.save();
    console.log("Updated Article 3 (Mobile Viewport Optimization) with qualified CLS & test methodology.");
  }

  console.log("All editorial qualifications applied successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
