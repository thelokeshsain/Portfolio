/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [25, 50, 60, 75, 90, 100]
  }
};

export default nextConfig;
