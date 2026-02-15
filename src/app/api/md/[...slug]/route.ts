import { notFound } from 'next/navigation';

import { formatPageForLLM, notesSource } from '@/lib/source';

// Config
// ---------------
export const generateStaticParams = async () => {
  const params = await notesSource.generateParams();
  return params.map(p => ({ slug: ['notes', ...p.slug] }));
};

// Route
// ---------------
export async function GET(_: Request, ctx: RouteContext<'/api/md/[...slug]'>) {
  const { slug } = await ctx.params;
  const [type, ...path] = slug;

  if (type !== 'notes') notFound();

  const page = notesSource.getPage(path);
  if (!page) notFound();

  const md = await formatPageForLLM(page);

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
