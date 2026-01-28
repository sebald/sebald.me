import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { miscSource } from '@/lib/source';
import { Article } from '@/ui/layout/article';
import { getMDXComponents } from '@/ui/mdx';

// Config
// ---------------
export const generateStaticParams = async () => miscSource.generateParams();

// Meta
// ---------------
export const generateMetadata = async (
  props: PageProps<'/[...slug]'>,
): Promise<Metadata> => {
  const params = await props.params;
  const page = miscSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
};

// Page
// ---------------
const Page = async (props: PageProps<'/[...slug]'>) => {
  const params = await props.params;
  const page = miscSource.getPage(params.slug);
  if (!page) notFound();

  const titleId = page.url;
  const MDX = page.data.body;

  return (
    <Article aria-labelledby={titleId}>
      <Article.Header>
        <Article.Title id={titleId} level="1">
          {page.data.title}
        </Article.Title>
      </Article.Header>
      <Article.Content>
        <MDX components={getMDXComponents()} />
      </Article.Content>
    </Article>
  );
};

export default Page;
