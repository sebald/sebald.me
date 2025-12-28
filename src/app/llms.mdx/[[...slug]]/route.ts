import { notFound } from 'next/navigation';

import {
  articlesSource,
  getLLMText,
  getPageBySlug,
  labsSource,
} from '@/lib/source';

export const revalidate = false;

interface RouteContext {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { slug = [] } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const markdown = await getLLMText(page);
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}

export function generateStaticParams() {
  const articlesParams = articlesSource.getPages().map((page) => ({
    slug: ['articles', ...page.slugs],
  }));

  const labsParams = labsSource.getPages().map((page) => ({
    slug: ['labs', ...page.slugs],
  }));

  return [...articlesParams, ...labsParams];
}
