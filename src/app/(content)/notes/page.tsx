import { MarkdownLogoIcon, RssIcon } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';

import { navItems } from '@/app.config';
import { excerpt, notesSource, sortByDate } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Note } from '@/ui/layout/note';
import { Link } from '@/ui/link';

// Config
// ---------------
export const revalidate = false;
const page = navItems.find(item => item.href === '/notes')!;

// Meta
// ---------------
export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

// Page
// ---------------
const NotesPage = async () => {
  const notes = sortByDate(notesSource.getPages());

  return (
    <div className="fit-prose grid gap-12 md:gap-16">
      <div className="flex items-end justify-between">
        <Headline level="4" variant="muted" as="h1">
          {page.title}
        </Headline>
        <div className="text-muted flex gap-2 text-sm">
          <Link
            aria-label="View notes as markdown"
            variant="inherit"
            noUnderline
            href="/notes.md"
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
        {notes.map(note => (
          <Note
            key={note.url}
            aria-labelledby={note.url}
            className="gap-2.5 text-base"
          >
            <Note.Header>
              <Link
                href={note.url}
                aria-label={`Read note: ${note.data.title}`}
                noUnderline
                className="[grid-area:title]"
              >
                <Note.Title id={note.url} variant="list">
                  {note.data.title}
                </Note.Title>
              </Link>
              <Note.Meta date={note.data.date} topics={note.data.topics} />
            </Note.Header>
            <Note.Excerpt>{excerpt(note)}</Note.Excerpt>
            <Link href={note.url} aria-label={`Read note: ${note.data.title}`}>
              Read more
            </Link>
          </Note>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
