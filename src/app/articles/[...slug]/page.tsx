import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { articlesSource, getPageImage } from '@/lib/source';
import { getMDXComponents } from '@/mdx-components';

const Page = async (props: PageProps<'/articles/[...slug]'>) => {
  const params = await props.params;
  const page = articlesSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <article className="prose prose-lg max-w-none">
      <header className="mb-8 border-b border-gray-200 pb-8">
        <h1 className="mb-4 text-4xl font-bold">{page.data.title}</h1>
        <p className="text-gray-600">{page.data.description}</p>
        {page.data.date && (
          <p className="mt-4 text-sm text-gray-500">
            {new Date(page.data.date).toLocaleDateString()}
          </p>
        )}
      </header>
      <MDX components={getMDXComponents()} />
    </article>
  );
};

export const generateStaticParams = async () => {
  return articlesSource.generateParams();
};

export const generateMetadata = async (
  props: PageProps<'/articles/[...slug]'>,
): Promise<Metadata> => {
  const params = await props.params;
  const page = articlesSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
};

export default Page;
