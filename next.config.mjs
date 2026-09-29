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
    localPatterns: [
      // Content images carry their content hash as `?v=`, the route rejects
      // any other version
      { pathname: '/api/content-image/**' },
      // Everything else without a query string
      { pathname: '/**', search: '' },
    ],
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
