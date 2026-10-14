import connectDB from "../src/lib/db.js";
import Article from "../src/models/Article.js";

async function main() {
  await connectDB();
  console.log("Connected to MongoDB.");

  const cleanAuthor = {
    name: "Lokesh Sain",
    role: "Software Engineer",
    bio: "Software Engineer based in Jaipur, India. Writing technical deep-dives on software architecture, Next.js performance, cloud security, and web engineering.",
    avatar: ""
  };

  const result = await Article.updateMany(
    { status: "published" },
    { $set: { author: cleanAuthor } }
  );

  console.log(`Updated ${result.modifiedCount} articles in MongoDB with clean author bio.`);

  const articles = await Article.find({ status: "published" }).lean();
  for (const a of articles) {
    console.log(a.slug, "author bio:", a.author?.bio);
  }

  process.exit(0);
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
