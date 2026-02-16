import { notFound } from 'next/navigation';
import { resolve } from 'node:path';

import { createOgImage, getCustomOgImage } from '@/lib/og';
import { miscSource, notesSource } from '@/lib/source';

// Helper
// ---------------
const NOTES_DIR = resolve(process.cwd(), 'content/notes');
const MISC_DIR = resolve(process.cwd(), 'content/misc');

/** Strip `.png` from the last segment to get page slugs */
const toPageSlugs = (slug: string[]) => [
  ...slug.slice(0, -1),
  slug.at(-1)!.replace(/\.png$/, ''),
];

const toOgSlug = (slugs: string[]) => [
  ...slugs.slice(0, -1),
  `${slugs.at(-1)}.png`,
];

// Config
// ---------------
export const revalidate = false;

export const generateStaticParams = () => {
  const noteParams = notesSource.getPages().map(page => ({
    slug: toOgSlug(page.slugs),
  }));
  const miscParams = miscSource.getPages().map(page => ({
    slug: toOgSlug(page.slugs),
  }));

  return [...noteParams, ...miscParams];
};

// Handler
// ---------------
export const GET = async (
  _req: Request,
  { params }: RouteContext<'/og/[...slug]'>,
) => {
  const { slug } = await params;
  const pageSlugs = toPageSlugs(slug);

  const notePage = notesSource.getPage(pageSlugs);
  const page = notePage ?? miscSource.getPage(pageSlugs);

  if (!page) notFound();

  const customImage = await getCustomOgImage(
    page.path,
    notePage ? NOTES_DIR : MISC_DIR,
  );

  if (customImage) {
    return new Response(customImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  return createOgImage(page.data.title, page.data.description);
};
