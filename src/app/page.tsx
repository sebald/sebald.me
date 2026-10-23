import { notesSource, sortByDate } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { TimeLogo } from '@/ui/logo-time';
import { Text } from '@/ui/text';

const Intro = () => (
  <header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
    <TimeLogo size={82} />
    <div className="grid gap-8">
      <div className="grid gap-2.5">
        <Headline level="2" as="h1">
          Sebastian Sebald
        </Headline>
        <Text variant="muted" size="caption">
          Software Architect at Reservix, Freiburg
        </Text>
      </div>
      <Text wrap="balance">
        I work at the intersection of code and user experience. Lately that
        means building a design system for a product that&apos;s two decades
        old, and for everything that comes next.
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

const NotesList = () => {
  const notes = sortByDate(notesSource.getPages());

  return (
    <section className="grid gap-10">
      {/* A label, not a competitor to the note titles below it */}
      <Headline
        level="3"
        className="text-[0.8125rem] font-medium tracking-[0.08em] text-muted-foreground uppercase md:text-xs"
      >
        Notes
      </Headline>
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

const HomePage = () => (
  <div className="grid gap-20 pt-10 sm:gap-40 md:pt-32">
    <Intro />
    <NotesList />
  </div>
);

export default HomePage;
