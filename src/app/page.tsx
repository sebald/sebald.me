import { ArrowRightIcon } from '@phosphor-icons/react/ssr';

import { LAB_ENTRIES, labUrl } from '@/lib/lab';
import { notesSource, sortByDate } from '@/lib/source';
import type { BentoProps } from '@/ui/bento';
import { Bento } from '@/ui/bento';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { TimeLogo } from '@/ui/logo-time';
import { Text } from '@/ui/text';

// Set apart from the notes by size and brightness alone: the name outranks
// every note title, the intro is brighter than the note descriptions
const Intro = () => (
  // The logo holds its own column from tablet up and sits above on phones
  <header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-8">
    <TimeLogo size={82} />
    <div className="grid gap-8">
      <div className="grid gap-2">
        <Headline
          level="1"
          as="h1"
          className="text-3xl tracking-tight text-mist-50 sm:text-4xl"
        >
          Sebastian Sebald
        </Headline>
        <Text variant="muted">Software Architect at Reservix, Freiburg</Text>
      </div>
      <Text className="text-accent-foreground">
        I work on software that has grown for over two decades, and lead the
        effort to reshape it around the people who use it every day. Most days
        that means bringing people together, the other days code or design.
      </Text>
    </div>
  </header>
);

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// A section's label, not a competitor to the titles below it
const Label = ({ children }: { children: string }) => (
  <Headline
    level="3"
    className="text-[0.8125rem] font-medium tracking-[0.08em] text-muted-foreground uppercase md:text-xs"
  >
    {children}
  </Headline>
);

const NotesList = () => {
  const notes = sortByDate(notesSource.getPages());

  return (
    <section className="grid gap-10">
      <Label>Notes</Label>
      <ul className="grid gap-14 sm:gap-20">
        {notes.map(note => (
          <li key={note.url} className="grid gap-2">
            {note.data.date && (
              <Text variant="muted" size="caption" as="span">
                <time dateTime={String(note.data.date)}>
                  {formatDate(note.data.date)}
                </time>
              </Text>
            )}
            <Link href={note.url} variant="inherit">
              <Headline level="2" as="h2">
                {note.data.title}
              </Headline>
            </Link>
            <Text>{note.data.description}</Text>
          </li>
        ))}
      </ul>
    </section>
  );
};

// The entry's pictures. They repeat the title's link for the pointer, so
// they are hidden from screen readers and skipped by the keyboard
const Pictures = ({
  href,
  layout,
  images,
}: {
  href: string;
  layout: BentoProps['layout'];
  images: readonly string[];
}) => (
  <Link
    href={href}
    variant="inherit"
    tabIndex={-1}
    aria-hidden="true"
    className="block w-full max-w-72"
  >
    <Bento layout={layout}>
      {images.map(src => (
        <Bento.Tile key={src} src={src} />
      ))}
    </Bento>
  </Link>
);

// An entry with pictures: beside the text from tablet up, above it on
// phones
const Entry = ({
  as: As = 'div',
  children,
}: {
  as?: 'div' | 'li';
  children: React.ReactNode;
}) => (
  <As className="grid gap-4 sm:grid-cols-[18rem_1fr] sm:gap-6">{children}</As>
);

// The link below an entry: its arrow hangs into the margin (the link's own
// 4px inset, the 12px arrow and the 6px gap), so the text lines up with
// the paragraph above
const entryLink = 'mt-4 w-fit -ml-5.5';

// What I am building at work, laid out like a note
const CurrentWork = () => (
  <section className="grid gap-10">
    <Label>Current work</Label>
    <Entry>
      <Pictures
        href="https://www.marigold-ui.io"
        layout="side"
        images={[
          '/home/marigold-venue.webp',
          '/home/marigold-palette.webp',
          '/home/marigold-flower.webp',
        ]}
      />
      <div className="grid content-start gap-2">
        <Link href="https://www.marigold-ui.io" variant="inherit">
          <Headline level="2" as="h2">
            Marigold
          </Headline>
        </Link>
        <Text>
          Reservix&apos;s open-source design system. It defines how our product
          looks and works, and the code it is built with.
        </Text>
        <Link
          href="https://www.marigold-ui.io"
          size="small"
          className={entryLink}
        >
          <ArrowRightIcon weight="bold" aria-hidden />
          Visit marigold-ui.io
        </Link>
      </div>
    </Entry>
  </section>
);

// Things that are more code than prose, laid out like the notes
const LabList = () => (
  <section className="grid gap-10">
    <Label>Lab</Label>
    <ul className="grid gap-14 sm:gap-20">
      {LAB_ENTRIES.map(entry => (
        <Entry as="li" key={entry.slug}>
          {entry.images && (
            <Pictures href={labUrl(entry)} layout="top" images={entry.images} />
          )}
          <div className="grid content-start gap-2">
            <Link href={labUrl(entry)} variant="inherit">
              <Headline level="2" as="h2">
                {entry.title}
              </Headline>
            </Link>
            <Text>{entry.blurb}</Text>
            <Link href={labUrl(entry)} size="small" className={entryLink}>
              <ArrowRightIcon weight="bold" aria-hidden />
              Play {entry.title}
            </Link>
          </div>
        </Entry>
      ))}
    </ul>
  </section>
);

const HomePage = () => (
  <div className="grid gap-20 pt-10 sm:gap-32 md:pt-32">
    <Intro />
    {/* The sections a step further apart than the intro is from them */}
    <div className="grid gap-23 sm:gap-35">
      <NotesList />
      <CurrentWork />
      <LabList />
    </div>
  </div>
);

export default HomePage;
