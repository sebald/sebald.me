import { notesSource, sortByDate } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { TimeLogo } from '@/ui/logo-time';
import { Text } from '@/ui/text';

// Set apart from the notes by size and brightness alone: the name outranks
// every note title, the intro reads as a lede above the note descriptions
const Intro = () => (
  // The logo holds its own column from tablet up and sits above on phones
  <header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-8">
    <TimeLogo size={56} />
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
      <Text className="text-lg text-accent-foreground">
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
  <div className="grid gap-16 pt-10 sm:gap-24 md:pt-32">
    <Intro />
    <NotesList />
  </div>
);

export default HomePage;
