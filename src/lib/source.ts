import { type InferPageType, loader } from 'fumadocs-core/source';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import { articles, lab, misc } from 'fumadocs-mdx:collections/server';

import { truncateAtWord } from './string.utils';

// Loaders
// ---------------
export const articlesSource = loader({
  baseUrl: '/articles',
  source: toFumadocsSource(articles, []),
});

export const labSource = loader({
  baseUrl: '/lab',
  source: toFumadocsSource(lab, []),
});

export const miscSource = loader({
  baseUrl: '/misc',
  source: toFumadocsSource(misc, []),
});

export type ContentPage =
  | InferPageType<typeof articlesSource>
  | InferPageType<typeof labSource>;

// Getters
// ---------------
export const getPageBySlug = (slug: string[]): ContentPage | undefined => {
  if (slug.length === 0) return undefined;

  // First element indicates the source (articles or lab)
  const source = slug[0];
  const pageSlugs = slug.slice(1);

  switch (source) {
    case 'articles':
      return articlesSource.getPage(pageSlugs);
    case 'lab':
      return labSource.getPage(pageSlugs);
    default:
      return undefined;
  }
};

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
export const pageImage = (page: ContentPage) => {
  const segments = [...page.slugs, 'image.png'];
  const type = page.url.includes('/lab') ? 'lab' : 'articles';

  return {
    segments,
    url: `/og/${type}/${segments.join('/')}`,
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
