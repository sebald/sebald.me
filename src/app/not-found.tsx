import type { Metadata } from 'next';

import native from '@/assets/not-found/native.png';
import poster from '@/assets/not-found/poster.png';
import scene from '@/assets/not-found/scene.webp';
import { toHotspots } from '@/lib/hotspots';
import { notesSource, sortByDate } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { PageToolbar } from '@/ui/page-toolbar';
import { PageTransition } from '@/ui/page-transition';
import { PixelImage } from '@/ui/pixel-image';
import { Text } from '@/ui/text';

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'Page not found',
};

// Hidden objects in the scene, in native pixels (see `native.png`)
const hotspots = toHotspots(
  [
    {
      name: 'lantern',
      remark: 'Burning for the next one. There’s always a next one.',
      at: [213, 55, 17, 30],
    },
    {
      name: 'signpost',
      remark:
        'Blank. Someone put up the signs first and planned to decide later.',
      at: [167, 32, 55, 50],
    },
    {
      name: 'edge',
      remark: 'I checked. There’s no page at the bottom either.',
      at: [243, 122, 45, 28],
    },
    {
      name: 'tree',
      remark: 'Older than the internet. Never once returned a 404.',
      at: [14, 40, 26, 96],
    },
  ],
  native,
);

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
    <PageTransition>
      <PageToolbar />
      {/* One column at content width, so the scene can break out of it */}
      <div className="grid grid-cols-1 gap-16">
        {/* A signpost with blank boards at the edge of the map, made with the
            pixel-header skill (examples/signpost.mjs). Wider than the text,
            up to 1120px, edge to edge on phones. */}
        <PixelImage
          src={scene.src}
          poster={poster.src}
          hotspots={hotspots}
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
    </PageTransition>
  );
};

export default NotFound;
