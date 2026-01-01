import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

import rehypeUnwrapContent from '@/lib/rehype/rehypeUnwrapContent';

const schema = frontmatterSchema.extend({
  date: z
    .union([
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
        .transform((val) => new Date(val)),
      z.date(),
    ])
    .optional(),
  draft: z.boolean().default(false),
  topics: z.array(z.string()).optional(),
});

export const articles = defineDocs({
  dir: 'content/articles',
  docs: {
    schema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const labs = defineDocs({
  dir: 'content/labs',
  docs: {
    schema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    rehypePlugins: [rehypeUnwrapContent],
    rehypeCodeOptions: {
      // Seems like fumadocs does not support "theme" value
      themes: {
        light: 'github-light-default',
        dark: 'github-light-default',
      },
      inline: 'tailing-curly-colon',
    },
  },
});
