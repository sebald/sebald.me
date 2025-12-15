import { createFromSource } from 'fumadocs-core/search/server';

import { articlesSource, labsSource } from '@/lib/source';

const articlesSearch = createFromSource(articlesSource, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});

const labsSearch = createFromSource(labsSource, {
  language: 'english',
});

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  if (type === 'labs') {
    return labsSearch.GET(request);
  }

  // Default to articles
  return articlesSearch.GET(request);
};
