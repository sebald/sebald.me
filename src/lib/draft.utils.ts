/**
 * Drafts are visible while writing (dev server) and on Vercel preview
 * deployments (behind Vercel Authentication), never in production or any
 * other build.
 */
export const shouldShowDrafts = (
  env: Record<string, string | undefined> = process.env,
) => env.NODE_ENV === 'development' || env.VERCEL_ENV === 'preview';

export const isVisible = (
  entry: { draft?: boolean },
  showDrafts = shouldShowDrafts(),
) => showDrafts || !entry.draft;
