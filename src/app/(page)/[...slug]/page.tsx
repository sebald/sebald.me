import { MarkdownLogoIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { miscSource } from '@/lib/source';
import { Article } from '@/ui/layout/article';
import {
  CopyLinkItem,
  CopyMarkdownLinkItem,
} from '@/ui/layout/article-actions';
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
    <Article aria-labelledby={titleId}>
      <Article.Header>
        <Article.Actions>
          <CopyLinkItem />
          <CopyMarkdownLinkItem href={`${page.url}.md`} />
          <Article.ActionsSeparator />
          <Article.ActionsItem href={`${page.url}.md`}>
            <MarkdownLogoIcon size={16} />
            View as markdown
          </Article.ActionsItem>
        </Article.Actions>
        <Article.Title id={titleId}>{page.data.title}</Article.Title>
      </Article.Header>
      <Article.Content>
        <MDX components={getMDXComponents()} />
      </Article.Content>
    </Article>
  );
};

export default Page;
