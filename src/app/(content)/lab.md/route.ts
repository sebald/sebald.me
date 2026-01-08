import { formatPagesForLLM, labSource, sortByDate } from '@/lib/source';

// Config
// ---------------
export const revalidate = false;

// Route
// ---------------
export async function GET() {
  const pages = labSource.getPages();
  const content = await formatPagesForLLM(sortByDate(pages));

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
