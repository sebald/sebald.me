import {
  defineCollections,
  defineConfig,
  frontmatterSchema,
} from 'fumadocs-mdx/config';
import { dirname, isAbsolute, join, normalize, relative } from 'node:path';
import { z } from 'zod';

import rehypeUnwrapContent from '@/lib/rehype/rehypeUnwrapContent';

/**
 * Resolve a potentially relative image path against the MDX file location.
 * Absolute paths and external URLs are returned as-is.
 * Relative paths (e.g. `./hero.webp`) are resolved to `/api/content-image/<resolved>`.
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
  return `/api/content-image/${rel}`;
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
    image: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform(val => {
        if (!val) return val;
        if (Array.isArray(val))
          return val.map(s => resolveImagePath(s, ctx.path));
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
