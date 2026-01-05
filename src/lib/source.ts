import { type InferPageType, loader } from 'fumadocs-core/source';
import { articles, lab, misc } from 'fumadocs-mdx:collections/server';

import { truncateAtWord } from './string.utils';

// Loaders
// ---------------
export const articlesSource = loader({
  baseUrl: '/articles',
  source: articles.toFumadocsSource(),
});

export const labSource = loader({
  baseUrl: '/lab',
  source: lab.toFumadocsSource(),
});

export const miscSource = loader({
  baseUrl: '/misc',
  source: misc.toFumadocsSource(),
});

// Getters
// ---------------
export const getPageBySlug = (
  slug: string[],
):
  | InferPageType<typeof articlesSource>
  | InferPageType<typeof labSource>
  | undefined => {
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

export const getLLMText = async (
  page: InferPageType<typeof articlesSource> | InferPageType<typeof labSource>,
) => {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
};

// Utilities
// ---------------
export const pageImage = (
  page: InferPageType<typeof articlesSource> | InferPageType<typeof labSource>,
) => {
  const segments = [...page.slugs, 'image.png'];
  const type = page.url.includes('/lab') ? 'lab' : 'articles';

  return {
    segments,
    url: `/og/${type}/${segments.join('/')}`,
  };
};

export const sortByDate = <
  T extends
    | InferPageType<typeof articlesSource>
    | InferPageType<typeof labSource>,
>(
  pages: T[],
): T[] => {
  return pages.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });
};

export const excerpt = (
  page: InferPageType<typeof articlesSource> | InferPageType<typeof labSource>,
  length: number = 200,
) => {
  const { contents } = page.data.structuredData;

  if (contents.length === 0) return '';

  const { content } = contents[0];
  return truncateAtWord(content, length);
};
