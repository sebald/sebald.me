import { MarkdownLogoIcon, RssIcon } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';

import { navItems } from '@/app.config';
import { articlesSource, excerpt, sortByDate } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Article } from '@/ui/layout/article';
import { Link } from '@/ui/link';

// Config
// ---------------
export const relative = false;
export const dynamic = 'force-static';

// Meta
// ---------------
const page = navItems.find(item => item.href === '/articles')!;
export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

// Page
// ---------------
const ArticlesPage = async () => {
  const articles = sortByDate(articlesSource.getPages());

  return (
    <div className="fit-prose grid gap-12 md:gap-16">
      <div className="flex items-end justify-between">
        <Headline level="3" variant="accent" as="h1">
          {page.title}
        </Headline>
        <div className="text-muted flex items-center gap-2 text-sm">
          <Link
            aria-label="View articles as markdown"
            variant="inherit"
            noUnderline
            href="/articles.md"
          >
            <MarkdownLogoIcon size={16} />
            Markdown
          </Link>
          <span className="text-muted text-sm">·</span>
          <Link
            aria-label="View article RSS feed"
            variant="inherit"
            noUnderline
            href="/rss.xml"
          >
            <RssIcon size={16} />
            RSS Feed
          </Link>
        </div>
      </div>

      <div className="space-y-20">
        {articles.map(article => (
          <Article
            key={article.url}
            aria-labelledby={article.url}
            className="gap-2.5 text-base"
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
