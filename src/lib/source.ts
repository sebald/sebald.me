import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { articles, labs } from 'fumadocs-mdx:collections/server';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const articlesSource = loader({
  baseUrl: '/articles',
  source: articles.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const labsSource = loader({
  baseUrl: '/labs',
  source: labs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const getPageImage = (
  page: InferPageType<typeof articlesSource> | InferPageType<typeof labsSource>,
) => {
  const segments = [...page.slugs, 'image.png'];
  const type = page.url.includes('/labs') ? 'labs' : 'articles';

  return {
    segments,
    url: `/og/${type}/${segments.join('/')}`,
  };
};

export const getLLMText = async (
  page: InferPageType<typeof articlesSource> | InferPageType<typeof labsSource>,
) => {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
};

export const sortByDate = <
  T extends InferPageType<typeof articlesSource> | InferPageType<typeof labsSource>,
>(pages: T[]): T[] => {
  return pages.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });
};

export const getPageBySlug = (
  slug: string[],
):
  | InferPageType<typeof articlesSource>
  | InferPageType<typeof labsSource>
  | undefined => {
  if (slug.length === 0) return undefined;

  // First element indicates the source (articles or labs)
  const source = slug[0];
  const pageSlugs = slug.slice(1);

  switch (source) {
    case 'articles':
      return articlesSource.getPage(pageSlugs);
    case 'labs':
      return labsSource.getPage(pageSlugs);
    default:
      return undefined;
  }
};
