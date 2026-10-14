import mongoose from "mongoose";
import Portfolio from "../src/models/Portfolio.js";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const p = await Portfolio.findOne().lean();
  console.log("=== PORTFOLIO PROJECTS ===");
  if (p && p.projects) {
    p.projects.forEach((pr, i) => {
      console.log(`[${i + 1}] Title: ${pr.title}`);
      console.log(`    Category: ${pr.category}`);
      console.log(`    Period: ${pr.period}`);
      console.log(`    Tags: ${pr.tags?.join(", ")}`);
      console.log(`    Link: ${pr.link}`);
      console.log(`    Github: ${pr.github}`);
      console.log(`    Desc: ${pr.desc}`);
      console.log("-----------------------------------------");
    });
  }
  console.log("=== CORE STACK & ABOUT ===");
  console.log("Core stack:", p.coreStack);
  console.log("About lines:", p.about);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
