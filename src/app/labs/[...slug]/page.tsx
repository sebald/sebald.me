import { getPageImage, labsSource } from '@/lib/source';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';

const Page = async (props: PageProps<'/labs/[...slug]'>) => {
  const params = await props.params;
  const page = labsSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <article className="prose prose-lg max-w-none">
      <header className="mb-8 pb-8 border-b border-gray-200">
        <h1 className="text-4xl font-bold mb-4">{page.data.title}</h1>
        <p className="text-gray-600">{page.data.description}</p>
        {page.data.date && (
          <p className="text-sm text-gray-500 mt-4">
            {new Date(page.data.date).toLocaleDateString()}
          </p>
        )}
      </header>
      <MDX components={getMDXComponents()} />
    </article>
  );
};

const generateStaticParams = async () => {
  return labsSource.generateParams();
};

const generateMetadata = async (
  props: PageProps<'/labs/[...slug]'>
): Promise<Metadata> => {
  const params = await props.params;
  const page = labsSource.getPage(params.slug);
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
export { generateStaticParams, generateMetadata };
