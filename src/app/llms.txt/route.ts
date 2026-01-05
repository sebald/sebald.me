import { articlesSource, getLLMText, labSource } from '@/lib/source';

export const revalidate = false;

export const GET = async () => {
  const articlesPages = articlesSource.getPages().map(getLLMText);
  const labsPages = labSource.getPages().map(getLLMText);

  const allPages = await Promise.all([...articlesPages, ...labsPages]);
  return new Response(allPages.join('\n\n'));
};
