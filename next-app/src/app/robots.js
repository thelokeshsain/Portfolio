export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokeshsain.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin/'],
      },
      // Explicitly allow AI crawlers to index your portfolio
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin', '/api/admin/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/admin', '/api/admin/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin', '/api/admin/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin', '/api/admin/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin', '/api/admin/'],
      },
      {
        userAgent: 'Amazonbot',
        allow: '/',
        disallow: ['/admin', '/api/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
