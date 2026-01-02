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
        source: '/articles/:path*.mdx',
        destination: '/llms.mdx/articles/:path*',
      },
      {
        source: '/lab/:path*.mdx',
        destination: '/llms.mdx/lab/:path*',
      },
    ];
  },
};

export default withMDX(config);
