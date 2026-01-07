import {
  defineCollections,
  defineConfig,
  frontmatterSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

import rehypeUnwrapContent from '@/lib/rehype/rehypeUnwrapContent';

const schema = frontmatterSchema.extend({
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
});

const stripDatePrefix = (file: { flattenedPath: string }) => {
  const parts = file.flattenedPath.split('/');
  const fileName = parts.pop() ?? '';
  const cleanName = fileName.replace(/^\d{4}-\d{2}-\d{2}-/, '');

  return [...parts, cleanName];
};

export const articles = defineCollections({
  type: 'doc',
  dir: 'content/articles',
  schema,
  // slugs: stripDatePrefix, // Applies the URL cleaner
  postprocess: {
    includeProcessedMarkdown: true,
  },
});

export const lab = defineCollections({
  type: 'doc',
  dir: 'content/lab',
  schema,
  postprocess: {
    includeProcessedMarkdown: true,
  },
});

export const misc = defineCollections({
  type: 'doc',
  dir: 'content/misc',
  schema: frontmatterSchema,
});

// 4. Global Config
export default defineConfig({
  mdxOptions: {
    rehypePlugins: [rehypeUnwrapContent],
    rehypeCodeOptions: {
      themes: {
        light: 'github-light-default',
        dark: 'github-light-default',
      },
      inline: 'tailing-curly-colon',
    },
  },
});
