import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { miscSource, pageImage } from '@/lib/source';
import { Article } from '@/ui/article';
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

  const MDX = page.data.body;
  const titleId = `misc-${page.slugs.join('-')}`;

  return (
    <Article aria-labelledby={titleId} className="gap-12 md:gap-24">
      <Article.Header>
        <Article.Title id={titleId}>{page.data.title}</Article.Title>
      </Article.Header>
      <Article.Content>
        <MDX components={getMDXComponents()} />
      </Article.Content>
    </Article>
  );
};

export default Page;
