/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const CSP_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://va.vercel-scripts.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.google`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https://fonts.gstatic.com data:",
  `connect-src 'self' https://*.mongodb.net https://api.resend.com https://va.vercel-scripts.com https://pagead2.googlesyndication.com https://*.google.com https://*.google https://*.googlesyndication.com ${isDev ? 'ws: wss: http://localhost:*' : ''}`.trim(),
  "frame-src 'self' https://googleads.g.doubleclick.net https://*.google.com https://*.google https://*.googlesyndication.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const SECURITY_HEADERS = [
  {
    key: 'Content-Security-Policy',
    value: CSP_POLICY,
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
];

const nextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [25, 50, 60, 75, 90, 100],
    localPatterns: [
      {
        pathname: '/images/**',
      },
      {
        pathname: '/icons/**',
      },
      {
        pathname: '/api/**',
        search: '?v=*',
      },
      {
        pathname: '/api/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=2592000',
          },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=2592000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
