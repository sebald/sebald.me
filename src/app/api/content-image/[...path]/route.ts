import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

import { imageVersion } from '@/lib/content-image';

const ROOT = process.cwd();
const CONTENT_DIR = resolve(ROOT, 'content');

const MIME_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

// Versioned URLs never change their content: cache them for a year, in the
// browser and on the CDN (`s-maxage`)
const VERSIONED = 'public, max-age=31536000, s-maxage=31536000, immutable';
const UNVERSIONED = 'public, max-age=3600';

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await ctx.params;
  const filePath = normalize(join(ROOT, ...segments));

  // Only serve files within the content directory
  if (!filePath.startsWith(CONTENT_DIR)) notFound();

  const ext = extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext];
  if (!mime) notFound();

  const data = await readFile(filePath).catch(() => null);
  if (!data) notFound();

  // Only the current version exists, so made-up versions cannot fill the
  // image optimizer's or the CDN's cache
  const version = new URL(req.url).searchParams.get('v');
  if (version && version !== imageVersion(data)) notFound();

  return new Response(data, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': version ? VERSIONED : UNVERSIONED,
    },
  });
}
