import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  async rewrites() {
    return [
      {
        source: '/:section/:path*.md',
        destination: '/api/md/:section/:path*',
      },
    ];
  },
};

export default withMDX(config);
