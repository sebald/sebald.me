import { MarkdownLogoIcon, RssIcon } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';

import { navItems } from '@/app.config';
import { labSource, sortByDate } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Article } from '@/ui/layout/note';
import { Link } from '@/ui/link';

// Config
// ---------------
export const revalidate = false;

// Meta
// ---------------
const page = navItems.find(item => item.href === '/lab')!;
export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

// Page
// ---------------
const LabIndex = async () => {
  const items = sortByDate(labSource.getPages());

  return (
    <div className="fit-prose grid gap-12 md:gap-16">
      <div className="flex items-end justify-between">
        <Headline level="4" variant="muted" as="h1">
          {page.title}
        </Headline>
        <div className="text-muted flex gap-2 text-sm">
          <Link
            aria-label="View lab items as markdown"
            variant="inherit"
            noUnderline
            href="/lab.md"
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

      <div className="grid grid-cols-2 gap-x-12 gap-y-16">
        {items.map(item => (
          <Article
            key={item.url}
            aria-labelledby={item.url}
            className="gap-2.5 text-base"
          >
            <Article.Header>
              <Link
                href={item.url}
                aria-label={`Read article: ${item.data.title}`}
                noUnderline
                className="[grid-area:title]"
              >
                <Article.Title id={item.url} variant="list">
                  {item.data.title}
                </Article.Title>
              </Link>
            </Article.Header>
            <Article.Excerpt>{item.data.description}</Article.Excerpt>
            <div className="pt-4">
              <Link
                href={item.url}
                aria-label={`Read article: ${item.data.title}`}
                variant="ghost"
                noUnderline
              >
                View
              </Link>
            </div>
          </Article>
        ))}
      </div>
    </div>
  );
};

export default LabIndex;
