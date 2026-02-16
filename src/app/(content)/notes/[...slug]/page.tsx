import { MarkdownLogoIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { notesSource, pageImage } from '@/lib/source';
import { ActionMenu, ActionMenuItem, CopyLinkItem } from '@/ui/action-menu';
import { Article } from '@/ui/layout/article';
import { getMDXComponents } from '@/ui/mdx';
import { PageToolbar } from '@/ui/page-toolbar';

// Config
// ---------------
export const generateStaticParams = async () => notesSource.generateParams();

// Meta
// ---------------
export const generateMetadata = async (
  props: PageProps<'/[...slug]'>,
): Promise<Metadata> => {
  const params = await props.params;
  const page = notesSource.getPage(params.slug);
  if (!page) notFound();

  const image = pageImage(page);

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: 'article',
      publishedTime: page.data.date
        ? new Date(page.data.date).toISOString()
        : undefined,
      images: [image.url],
    },
    twitter: {
      card: 'summary_large_image',
      images: [image.url],
    },
  };
};

// Page
// ---------------
const Page = async (props: PageProps<'/[...slug]'>) => {
  const params = await props.params;
  const page = notesSource.getPage(params.slug);
  if (!page) notFound();

  const titleId = page.url;
  const MDX = page.data.body;

  return (
    <>
      <PageToolbar>
        <ActionMenu label="Article actions">
          <CopyLinkItem />
          <ActionMenuItem href={`${page.url}.md`}>
            <MarkdownLogoIcon weight="bold" />
            View as markdown
          </ActionMenuItem>
        </ActionMenu>
      </PageToolbar>
      <Article aria-labelledby={titleId}>
        <Article.Header>
          <Article.Title id={titleId} level="1">
            {page.data.title}
          </Article.Title>
        </Article.Header>
        {page.data.image && <Article.Image src={page.data.image} />}
        <Article.Content>
          <MDX components={getMDXComponents()} />
        </Article.Content>
      </Article>
    </>
  );
};

export default Page;
