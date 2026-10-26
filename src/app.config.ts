export const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

// Used for the site's meta description and the RSS feed
export const siteDescription =
  'Notes by Sebastian Sebald on modernizing long-lived software, design systems and building products around the people who use them.';

export const socialLinks = {
  github: 'https://github.com/sebald',
  linkedin: 'https://www.linkedin.com/in/sebastian-sebald',
  x: 'https://x.com/sebastiansebald',
  email: 'mailto:sebastian.sebald@gmail.com',
} as const;
