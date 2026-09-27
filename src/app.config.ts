export const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

// Only enable Google Analytics on production. `NEXT_PUBLIC_GA_ID` may be
// configured for all Vercel environments, so gate on `VERCEL_ENV` as well to
// keep it from loading on preview/development deployments.
export const gaId =
  process.env.VERCEL_ENV === 'production'
    ? process.env.NEXT_PUBLIC_GA_ID
    : undefined;

export const socialLinks = {
  github: 'https://github.com/sebald',
  linkedin: 'https://www.linkedin.com/in/sebastian-sebald',
  x: 'https://x.com/sebastiansebald',
} as const;
