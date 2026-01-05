import { articlesSource, formatPagesForLLM, labSource } from '@/lib/source';

export const revalidate = false;

export const GET = async () => {
  const text = await formatPagesForLLM([
    ...articlesSource.getPages(),
    ...labSource.getPages(),
  ]);
  return new Response(`# sebald.me - Content Archive\n\n${text}`);
};
