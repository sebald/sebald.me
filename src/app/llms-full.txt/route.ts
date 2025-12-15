import { articlesSource, getLLMText, labsSource } from '@/lib/source';

export const revalidate = false;

export const GET = async () => {
  const articlesPages = articlesSource.getPages().map(getLLMText);
  const labsPages = labsSource.getPages().map(getLLMText);

  const allPages = await Promise.all([...articlesPages, ...labsPages]);

  return new Response(allPages.join('\n\n'));
};
