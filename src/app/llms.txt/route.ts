import {
  articlesSource,
  formatPagesForLLM,
  labSource,
  sortByDate,
} from '@/lib/source';

// Config
// ---------------
export const revalidate = false;

// Route
// ---------------
export const GET = async () => {
  const pages = sortByDate([
    ...articlesSource.getPages(),
    ...labSource.getPages(),
  ]);
  const text = await formatPagesForLLM(pages);
  return new Response(`# sebald.me - Content Archive\n\n${text}`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
