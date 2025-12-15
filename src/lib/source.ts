import { articles, labs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

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
  page: InferPageType<typeof articlesSource> | InferPageType<typeof labsSource>
) => {
  const segments = [...page.slugs, 'image.png'];
  const type = page.url.includes('/labs') ? 'labs' : 'articles';

  return {
    segments,
    url: `/og/${type}/${segments.join('/')}`,
  };
};

export const getLLMText = async (
  page: InferPageType<typeof articlesSource> | InferPageType<typeof labsSource>
) => {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
};
