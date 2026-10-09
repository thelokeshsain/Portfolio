import connectDB from "@/lib/db";
import Article from "@/models/Article";

// Cache sitemap for 1 hour; revalidated on-demand when articles are published, edited, or archived
export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://lokeshsain.vercel.app";

  try {
    await connectDB();
    // Exclusively query published articles — never expose drafts or archived records
    const articles = await Article.find({ status: "published" })
      .select("slug updatedAt publishedAt")
      .sort({ publishedAt: -1 })
      .lean();

    // Truthful lastModified: reflects the latest published or updated article date
    const latestArticleDate =
      articles.length > 0
        ? articles[0].updatedAt || articles[0].publishedAt
        : new Date("2026-10-09T00:00:00.000Z");

    const staticRoutes = [
      {
        url: baseUrl,
        lastModified: latestArticleDate,
        changeFrequency: "weekly",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: latestArticleDate,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date("2026-10-09T00:00:00.000Z"),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    const articleRoutes = articles.map((art) => ({
      url: `${baseUrl}/blog/${art.slug}`,
      lastModified: art.updatedAt || art.publishedAt || new Date("2026-10-09T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    return [...staticRoutes, ...articleRoutes];
  } catch (err) {
    console.error("Sitemap article fetch error:", err.message);
    return [
      {
        url: baseUrl,
        lastModified: new Date("2026-10-09T00:00:00.000Z"),
        changeFrequency: "weekly",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date("2026-10-09T00:00:00.000Z"),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date("2026-10-09T00:00:00.000Z"),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];
  }
}
