import { LAB_ENTRIES, labUrl } from '@/lib/lab';
import { notesSource, sortByDate } from '@/lib/source';
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

// What I am building at work, laid out like a note
const CurrentWork = () => (
  <section className="grid gap-10">
    <Label>Current work</Label>
    <div className="grid gap-2">
      <Link href="https://www.marigold-ui.io" variant="inherit">
        <Headline level="2" as="h2">
          Marigold
        </Headline>
      </Link>
      <Text>
        Reservix&apos;s open-source design system, and the driver for reshaping
        our product around the people who use it.
      </Text>
    </div>
  </section>
);

// Things that are more code than prose, laid out like the notes
const LabList = () => (
  <section className="grid gap-10">
    <Label>Lab</Label>
    <ul className="grid gap-14 sm:gap-20">
      {LAB_ENTRIES.map(entry => (
        <li key={entry.slug} className="grid gap-2">
          <Link href={labUrl(entry)} variant="inherit">
            <Headline level="2" as="h2">
              {entry.title}
            </Headline>
          </Link>
          <Text>{entry.blurb}</Text>
        </li>
      ))}
    </ul>
  </section>
);

const HomePage = () => (
  <div className="grid gap-20 pt-10 sm:gap-32 md:pt-32">
    <Intro />
    <NotesList />
    <CurrentWork />
    <LabList />
  </div>
);

export default HomePage;
