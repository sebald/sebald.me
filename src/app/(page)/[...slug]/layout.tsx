import { MarkdownLogoIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { miscSource } from '@/lib/source';
import { Article } from '@/ui/layout/article';
import { CopyLinkItem } from '@/ui/layout/article-actions';

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

// Layout
// ---------------
const SlugLayout = async ({ children, params }: LayoutProps<'/[...slug]'>) => {
  const { slug } = await params;
  const page = miscSource.getPage(slug);
  if (!page) notFound();

  const titleId = page.url;

  return (
    <Article aria-labelledby={titleId}>
      <Article.Header>
        <Article.Title id={titleId} level="1">
          {page.data.title}
        </Article.Title>
      </Article.Header>
      <Article.Content>{children}</Article.Content>
    </Article>
  );
};

export default SlugLayout;
