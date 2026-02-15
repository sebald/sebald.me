import { MarkdownLogoIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ActionMenu, ActionMenuItem, CopyLinkItem } from '@/ui/action-menu';
import { notesSource } from '@/lib/source';
import { Article } from '@/ui/layout/article';
import { getMDXComponents } from '@/ui/mdx';

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

  return {
    title: page.data.title,
    description: page.data.description,
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
    <Article aria-labelledby={titleId}>
      <Article.Header>
        <Article.Actions>
          <ActionMenu label="Article actions">
            <CopyLinkItem />
            <ActionMenuItem href={`${page.url}.md`}>
              <MarkdownLogoIcon weight="bold" />
              View as markdown
            </ActionMenuItem>
          </ActionMenu>
        </Article.Actions>
        <Article.Title id={titleId} level="1">
          {page.data.title}
        </Article.Title>
      </Article.Header>
      {page.data.image && <Article.Image src={page.data.image} />}
      <Article.Content>
        <MDX components={getMDXComponents()} />
      </Article.Content>
    </Article>
  );
};

export default Page;
