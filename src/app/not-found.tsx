import type { Metadata } from 'next';

import poster from '@/assets/not-found/poster.png';
import scene from '@/assets/not-found/scene.webp';
import { notesSource, sortByDate } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { PageToolbar } from '@/ui/page-toolbar';
import { PixelImage } from '@/ui/pixel-image';
import { Text } from '@/ui/text';

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'Page not found',
};

// Helpers
// ---------------
const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

// Page
// ---------------
const NotFound = () => {
  const notes = sortByDate(notesSource.getPages()).slice(0, 3);

  return (
    <>
      <PageToolbar />
      {/* One column at content width, so the scene can break out of it */}
      <div className="grid grid-cols-1 gap-16">
        {/* A signpost with blank boards at the edge of the map, made with the
            pixel-header skill (examples/signpost.mjs). Wider than the text,
            up to 1120px, edge to edge on phones. */}
        <PixelImage
          src={scene.src}
          poster={poster.src}
          aspect="5/2"
          className="relative left-1/2 w-[min(1120px,100vw)] -translate-x-1/2 md:w-[min(1120px,calc(100vw-4rem))] md:rounded-2xl"
        />

        <header className="grid gap-5">
          <Text variant="muted" size="caption">
            Error 404
          </Text>
          <Headline level="1" as="h1" className="text-3xl tracking-tight">
            Off the map
          </Headline>
          <Text className="text-pretty">
            There is nothing at this address. The boards point somewhere else:
          </Text>
        </header>

        {/* The latest notes, listed like on the home page */}
        <nav aria-label="Latest notes">
          <ul className="grid gap-10">
            {notes.map(note => (
              <li key={note.url} className="grid gap-2">
                {note.data.date && (
                  <Text variant="muted" size="caption" as="span">
                    <time dateTime={String(note.data.date)}>
                      {formatDate(note.data.date)}
                    </time>
                  </Text>
                )}
                <Link href={note.url} variant="inherit" className="w-fit">
                  <Headline level="2" as="h2">
                    {note.data.title}
                  </Headline>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default NotFound;
