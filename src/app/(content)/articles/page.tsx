import Link from 'fumadocs-core/link';
import type { Metadata } from 'next';

import { articlesSource, getExcerpt, sortByDate } from '@/lib/source';
import { Article } from '@/ui/article';
import { Headline } from '@/ui/headline';

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
      <Headline level="1" variant="accent" as="h1">
        Articles
      </Headline>

      {articles.map(async (page) => {
        const excerpt = await getExcerpt(page);
        return (
          <Article key={page.url} aria-labelledby={page.url}>
            <Article.Header flow="reverse">
              <Article.Title id={page.url} variant="list">
                {page.data.title}
              </Article.Title>
              <Article.Meta date={page.data.date} topics={page.data.topics} />
            </Article.Header>
            <Article.Excerpt>{excerpt}</Article.Excerpt>
          </Article>
        );
      })}
    </div>
  );
};

export default ArticlesIndex;
