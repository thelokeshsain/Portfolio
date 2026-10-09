import connectDB from "@/lib/db";
import Article from "@/models/Article";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://lokeshsain.vercel.app";

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    await connectDB();
    // Exclusively query published articles — never expose drafts or archived records
    const articles = await Article.find({ status: "published" })
      .select("slug updatedAt publishedAt")
      .lean();

    const articleRoutes = articles.map((art) => ({
      url: `${baseUrl}/blog/${art.slug}`,
      lastModified: art.updatedAt || art.publishedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    return [...staticRoutes, ...articleRoutes];
  } catch (err) {
    console.error("Sitemap article fetch error:", err.message);
    return staticRoutes;
  }
}
