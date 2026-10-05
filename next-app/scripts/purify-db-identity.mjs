import mongoose from "mongoose";

async function purify() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in environment");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  const collection = mongoose.connection.collection("portfolios");
  const doc = await collection.findOne();

  if (!doc) {
    console.error("No portfolio document found.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("Current hero.description:", doc.hero?.description);
  console.log("Current about[0]:", doc.about?.[0]);
  console.log("Current experience count:", doc.experience?.length);

  const updatedHeroDescription = "I build scalable, performant web applications with React.js and modern web technologies. Focused on building clean, reliable, and user-centric products.";
  
  const updatedAbout0 = "I'm a Software Engineer focused on building responsive web applications, scalable products, and AI-powered experiences with modern web technologies.";

  // Set hero.image to null so it cleanly defaults to the Midnight Blueprint hero laptop mockup
  const result = await collection.updateOne(
    { _id: doc._id },
    {
      $set: {
        "hero.description": updatedHeroDescription,
        "hero.image": null,
        "about.0": updatedAbout0,
      },
    }
  );

  console.log("Update result:", result);

  // Re-verify the updated document
  const verified = await collection.findOne();
  console.log("\n--- VERIFICATION ---");
  console.log("Verified hero.description:", verified.hero?.description);
  console.log("Verified hero.image:", verified.hero?.image);
  console.log("Verified about[0]:", verified.about?.[0]);
  console.log("Verified experience count:", verified.experience?.length);
  console.log("Experience companies:", verified.experience?.map((e) => `${e.role} at ${e.company}`));

  const json = JSON.stringify(verified);
  const regex = /3handshake/gi;
  let match;
  console.log("\nAll occurrences of 3handshake in sanitized DB:");
  while ((match = regex.exec(json)) !== null) {
    const start = Math.max(0, match.index - 40);
    const end = Math.min(json.length, match.index + 70);
    console.log(`- Match at [${match.index}]: ${json.slice(start, end)}`);
  }

  await mongoose.disconnect();
  console.log("\nDB Purification Complete & Verified.");
}

purify().catch((err) => {
  console.error("Error purifying DB:", err);
  process.exit(1);
});
