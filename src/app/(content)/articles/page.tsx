import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';

import { articlesSource, getExcerpt, sortByDate } from '@/lib/source';
import { Article } from '@/ui/article';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { Text } from '@/ui/text';

// Config
// ---------------
export const revalidate = false;

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'Articles',
  description: 'A collection of articles about web development and design.',
};

// Page
// ---------------
const ArticlesIndex = async () => {
  const articles = sortByDate(articlesSource.getPages());

  return (
    <div className="mx-auto grid max-w-[75ch] gap-20">
      <div>
        <Headline level="1" variant="accent" as="h1">
          Articles
        </Headline>
        <Text variant="faded" size="lead" leading="inherit">
          Notes from the road and lessons learned along the way. Welcome to the
          archive.
        </Text>
      </div>

      {articles.map(async (page) => {
        const excerpt = await getExcerpt(page);
        return (
          <Article key={page.url} aria-labelledby={page.url} space="2">
            <Article.Header flow="reverse">
              <Article.Title id={page.url} variant="list">
                {page.data.title}
              </Article.Title>
              <Article.Meta date={page.data.date} topics={page.data.topics} />
            </Article.Header>
            <Article.Excerpt>{excerpt}</Article.Excerpt>
            <Link
              href={page.url}
              aria-label={`Read article: ${page.data.title}`}
              noUnderline
            >
              Read full article
              <ArrowRightIcon
                className="transition-transform duration-200 group-hover/link:translate-x-1"
                size={16}
                weight="bold"
              />
            </Link>
          </Article>
        );
      })}
    </div>
  );
};

export default ArticlesIndex;
