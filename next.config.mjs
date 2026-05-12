/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'docs',
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
