export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://lokeshsain.vercel.app";

  const standardDisallow = ["/admin", "/api/admin/", "/blog/preview/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: standardDisallow,
      },
      // Explicitly allow search & AI crawlers to index portfolio and public perspectives
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: standardDisallow,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: standardDisallow,
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: standardDisallow,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: standardDisallow,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: standardDisallow,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: standardDisallow,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: standardDisallow,
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
        disallow: standardDisallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
