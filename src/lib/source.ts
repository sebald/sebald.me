import type { InferPageType } from 'fumadocs-core/source';
import { getSlugs, loader } from 'fumadocs-core/source';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import { misc, notes } from 'fumadocs-mdx:collections/server';

import { truncateAtWord } from './string.utils';

// Loaders
// ---------------
export const notesSource = loader({
  baseUrl: '/notes',
  source: toFumadocsSource(notes, []),
  // Remove date prefixes from slugs (only use this for ordering in the actual folder)
  slugs: file => getSlugs(file.path.replace(/(\/)?\d{4}-\d{2}-\d{2}-/, '$1')),
});

export const miscSource = loader({
  baseUrl: '/misc',
  source: toFumadocsSource(misc, []),
});

export type ContentPage = InferPageType<typeof notesSource>;

// Getters
// ---------------
export const formatPageForLLM = async (page: ContentPage) => {
  const processed = (await page.data.getText('processed')).trim();
  const date = page.data.date
    ? new Date(page.data.date).toISOString().split('T')[0]
    : '';
  const url = `https://sebald.me${page.url}`;
  const topics = page.data.topics?.join(', ') || '';

  return `Title: "${page.data.title}"
Date: ${date}
URL: ${url}
Topics: ${topics}

${processed}`;
};

export const formatPagesForLLM = async (pages: ContentPage[]) => {
  const all = await Promise.all(
    pages.map(async page => {
      const content = await formatPageForLLM(page);
      return `<article id="${page.url}">
${content}
</article>`;
    }),
  );

  return all.join('\n\n');
};

// Utilities
// ---------------
export const pageImage = (page: { slugs: string[]; url: string }) => {
  const segments = [...page.slugs.slice(0, -1), `${page.slugs.at(-1)}.webp`];

  return {
    segments,
    url: `/og/${segments.join('/')}`,
  };
};

export const sortByDate = <T extends ContentPage>(pages: T[]): T[] => {
  return pages.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });
};

export const excerpt = (page: ContentPage, length: number = 200) => {
  const { contents } = page.data.structuredData;

  if (contents.length === 0) return '';

  const { content } = contents[0];
  return truncateAtWord(content, length);
};
