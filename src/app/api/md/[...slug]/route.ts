import { notFound } from 'next/navigation';

import { type ContentPage, formatPageForLLM, labSource } from '@/lib/source';
import { articlesSource } from '@/lib/source';

// Route
// ---------------
export async function GET(_: Request, ctx: RouteContext<'/api/md/[...slug]'>) {
  const { slug } = await ctx.params;
  const [type, ...path] = slug;

  let page: ContentPage | undefined;
  switch (type) {
    case 'articles':
      page = articlesSource.getPage(path);
      break;
    case 'lab':
      page = labSource.getPage(path);
      break;
    default:
  }

  if (!page) notFound();

  const md = await formatPageForLLM(page);

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
