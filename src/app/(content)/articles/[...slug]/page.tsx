import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { articlesSource, getPageImage } from '@/lib/source';
import { Article } from '@/ui/article';
import { getMDXComponents } from '@/ui/mdx';

const Page = async (props: PageProps<'/articles/[...slug]'>) => {
  const params = await props.params;
  const page = articlesSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const titleId = `article-${page.slugs.join('-')}`;

  return (
    <Article aria-labelledby={titleId}>
      <Article.Header>
        <Article.Title id={titleId}>{page.data.title}</Article.Title>
        <div className="flex gap-2">
          {page.data.date && <Article.Time date={page.data.date} />}
          {page.data.date &&
            page.data.topics &&
            page.data.topics.length > 0 && (
              <span className="text-muted text-sm">·</span>
            )}
          {page.data.topics && page.data.topics.length > 0 && (
            <Article.Topics topics={page.data.topics} />
          )}
        </div>
      </Article.Header>
      <Article.Content>
        <MDX components={getMDXComponents()} />
      </Article.Content>
    </Article>
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
