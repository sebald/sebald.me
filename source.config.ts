import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

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
  dir: 'content/(content)/articles',
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
  dir: 'content/(content)/labs',
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
    rehypeCodeOptions: {
      theme: 'catppuccin-latte',
      inline: 'tailing-curly-colon',
    },
  },
});
