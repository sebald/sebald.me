import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { labSource, pageImage } from '@/lib/source';
import { Article } from '@/ui/layout/article';
import { getMDXComponents } from '@/ui/mdx';

// Config
// ---------------
export const generateStaticParams = async () => labSource.generateParams();

// Meta
// ---------------
export const generateMetadata = async (
  props: PageProps<'/lab/[...slug]'>,
): Promise<Metadata> => {
  const params = await props.params;
  const page = labSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: pageImage(page).url,
    },
  };
};

// Page
// ---------------
const Page = async (props: PageProps<'/lab/[...slug]'>) => {
  const params = await props.params;
  const page = labSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const titleId = `article-${page.slugs.join('-')}`;

  return (
    <Article aria-labelledby={titleId} className="gap-12 md:gap-24">
      <Article.Header>
        <Article.Title id={titleId}>{page.data.title}</Article.Title>
        <Article.Actions>
          <Article.MarkdownLink
            aria-label={`View "${page.data.title}" as markdown`}
            href={`${page.url}.md`}
          />
        </Article.Actions>
      </Article.Header>
      <Article.Content>
        <MDX components={getMDXComponents()} />
      </Article.Content>
    </Article>
  );
};

export default Page;
