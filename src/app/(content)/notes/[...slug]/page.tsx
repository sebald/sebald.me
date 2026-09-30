import { MarkdownLogoIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { openGraphDefaults, twitterDefaults } from '@/lib/og';
import { notesSource, pageImage } from '@/lib/source';
import { readingTime } from '@/lib/string.utils';
import { ActionMenu, ActionMenuItem, CopyLinkItem } from '@/ui/action-menu';
import { Article } from '@/ui/layout/article';
import { getMDXComponents } from '@/ui/mdx';
import { NoteMeta } from '@/ui/note-meta';
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
      ...openGraphDefaults,
      title: page.data.title,
      description: page.data.description,
      type: 'article',
      publishedTime: page.data.date
        ? new Date(page.data.date).toISOString()
        : undefined,
      images: [image.url],
    },
    twitter: {
      ...twitterDefaults,
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
  const minutes = readingTime(await page.data.getText('processed'));

  return (
    <>
      <PageToolbar>
        <ActionMenu label="Article actions">
          <CopyLinkItem />
          <ActionMenuItem href={`${page.url}.md`} event="View Markdown">
            <MarkdownLogoIcon weight="bold" aria-hidden />
            View as markdown
          </ActionMenuItem>
        </ActionMenu>
      </PageToolbar>
      <Article aria-labelledby={titleId}>
        <Article.Header>
          <Article.Title id={titleId} level="1">
            {page.data.title}
          </Article.Title>
          <NoteMeta date={page.data.date} minutes={minutes} />
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
