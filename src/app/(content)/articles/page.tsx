import type { Metadata } from 'next';

import { navItems } from '@/app.config';
import { articlesSource, excerpt, sortByDate } from '@/lib/source';
import { Article } from '@/ui/article';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';

// Config
// ---------------
export const relative = false;

const page = navItems.find(item => item.href === '/articles')!;

// Meta
// ---------------
export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

// Page
// ---------------
const ArticlesPage = async () => {
  const articles = sortByDate(articlesSource.getPages());

  return (
    <div className="mx-auto grid max-w-[75ch] gap-12 md:gap-16">
      <Headline level="4" variant="accent" as="h1">
        {page.title}
      </Headline>

      <div className="space-y-20">
        {articles.map(article => (
          <Article
            key={article.url}
            aria-labelledby={article.url}
            className="gap-2.5"
          >
            <Article.Header>
              <Link
                href={article.url}
                aria-label={`Read article: ${article.data.title}`}
                noUnderline
              >
                <Article.Title id={article.url} variant="list">
                  {article.data.title}
                </Article.Title>
              </Link>
              <Article.Meta
                date={article.data.date}
                topics={article.data.topics}
              />
            </Article.Header>
            <Article.Excerpt>{excerpt(article)}</Article.Excerpt>
            <Link
              href={article.url}
              aria-label={`Read article: ${article.data.title}`}
            >
              Read more
            </Link>
          </Article>
        ))}
      </div>
    </div>
  );
};

export default ArticlesPage;
