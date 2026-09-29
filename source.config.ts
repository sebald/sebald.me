import {
  defineCollections,
  defineConfig,
  frontmatterSchema,
} from 'fumadocs-mdx/config';
import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, relative } from 'node:path';
import { z } from 'zod';

import { imageVersion } from '@/lib/content-image';
import rehypeUnwrapContent from '@/lib/rehype/rehypeUnwrapContent';

/**
 * Resolve a potentially relative image path against the MDX file location.
 * Absolute paths and external URLs are returned as-is.
 * Relative paths (e.g. `./hero.webp`) are resolved to
 * `/api/content-image/<resolved>?v=<content hash>`, so a changed image gets a
 * new URL. A missing file fails the build.
 *
 * `ctx.path` can be absolute (dev server) or relative to cwd (build).
 */
const resolveImagePath = (src: string, filePath: string): string => {
  if (src.startsWith('/') || src.startsWith('http')) return src;
  const dir = dirname(filePath);
  const resolved = normalize(join(dir, src));
  const rel = isAbsolute(resolved)
    ? relative(process.cwd(), resolved)
    : resolved;
  const version = imageVersion(readFileSync(resolved));
  return `/api/content-image/${rel}?v=${version}`;
};

const notesSchema = (ctx: { path: string }) =>
  frontmatterSchema.extend({
    date: z
      .union([
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
          .transform(val => new Date(val)),
        z.date(),
      ])
      .optional(),
    draft: z.boolean().default(false),
    topics: z.array(z.string()).optional(),
    /**
     * One image, parallax layers (back to front), or pixel art (pre-scaled,
     * usually animated) with a still `poster` for reduced motion
     */
    image: z
      .union([
        z.string(),
        z.array(z.string()),
        z.object({ src: z.string(), poster: z.string() }),
      ])
      .optional()
      .transform(val => {
        if (!val) return val;
        if (Array.isArray(val))
          return val.map(s => resolveImagePath(s, ctx.path));
        if (typeof val === 'object')
          return {
            src: resolveImagePath(val.src, ctx.path),
            poster: resolveImagePath(val.poster, ctx.path),
          };
        return resolveImagePath(val, ctx.path);
      }),
  });

export const notes = defineCollections({
  type: 'doc',
  dir: 'content/notes',
  schema: notesSchema,
  postprocess: {
    includeProcessedMarkdown: true,
  },
});

export const misc = defineCollections({
  type: 'doc',
  dir: 'content/misc',
  schema: frontmatterSchema,
});

export default defineConfig({
  mdxOptions: {
    rehypePlugins: [rehypeUnwrapContent],
    rehypeCodeOptions: {
      themes: {
        light: 'github-dark-default',
        dark: 'github-dark-default',
      },
      inline: 'tailing-curly-colon',
    },
  },
});
