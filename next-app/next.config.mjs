/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,
  images: {
    qualities: [25, 50, 60, 75, 90, 100]
  },
  async headers() {
    return [
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
      }
    ];
  },
};

export default nextConfig;
