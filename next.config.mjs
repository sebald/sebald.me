import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    // Prefer AVIF output. Keep sources PNG or WebP, Vercel passes AVIF sources
    // through at full size
    formats: ['image/avif', 'image/webp'],
  },
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
