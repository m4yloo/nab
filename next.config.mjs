/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  devIndicators: {
    buildActivity: false,
  },
  basePath: '/nab',
  assetPrefix: '/nab',
};

export default nextConfig;
