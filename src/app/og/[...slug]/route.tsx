import { resolve } from 'node:path';

import { notFound } from 'next/navigation';

import { createDefaultOgImage, getCustomOgImage } from '@/lib/og';
import { notesSource } from '@/lib/source';

export const revalidate = false;

const NOTES_DIR = resolve(process.cwd(), 'content/notes');

/** Strip `.png` from the last segment to get page slugs */
const toPageSlugs = (slug: string[]) => [
  ...slug.slice(0, -1),
  slug.at(-1)!.replace(/\.png$/, ''),
];

const toOgSlug = (slugs: string[]) => [
  ...slugs.slice(0, -1),
  `${slugs.at(-1)}.png`,
];

export const GET = async (
  _req: Request,
  { params }: RouteContext<'/og/[...slug]'>,
) => {
  const { slug } = await params;
  const page = notesSource.getPage(toPageSlugs(slug));
  if (!page) notFound();

  const customImage = await getCustomOgImage(page.path, NOTES_DIR);
  if (customImage) {
    return new Response(customImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  return createDefaultOgImage();
};

export const generateStaticParams = () =>
  notesSource.getPages().map(page => ({
    slug: toOgSlug(page.slugs),
  }));
