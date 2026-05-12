/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  devIndicators: {
    buildActivity: false,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/nab' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/nab' : '',
};

export default nextConfig;
