import type { Metadata } from 'next';

import { articlesSource, getExcerpt, sortByDate } from '@/lib/source';
import { Article } from '@/ui/article';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Notes from the road and lessons learned along the way. Welcome to the archive.',
};

// Page
// ---------------
const ArticlesIndex = async () => {
  const articles = sortByDate(articlesSource.getPages());

  return (
    <div className="mx-auto grid max-w-[75ch] gap-12 md:gap-16">
      <Headline level="4" variant="accent" as="h1">
        Articles
      </Headline>

      <div className="space-y-20">
        {articles.map((page) => {
          const excerpt = getExcerpt(page);
          return (
            <Article
              key={page.url}
              aria-labelledby={page.url}
              className="gap-2.5"
            >
              <Article.Header>
                <Article.Title id={page.url} href={page.url} variant="list">
                  {page.data.title}
                </Article.Title>
                <Article.Meta date={page.data.date} topics={page.data.topics} />
              </Article.Header>
              <Article.Excerpt>{excerpt}</Article.Excerpt>
              <Link
                href={page.url}
                aria-label={`Read article: ${page.data.title}`}
              >
                Read more
              </Link>
            </Article>
          );
        })}
      </div>
    </div>
  );
};

export default ArticlesIndex;
