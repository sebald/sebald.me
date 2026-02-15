import { excerpt, notesSource, sortByDate } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { Logo } from '@/ui/logo';
import { Text } from '@/ui/text';

export const Intro = () => (
  <header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
    <Logo size={50} />
    <div className="grid gap-8">
      <div className="grid gap-2">
        <Text variant="accent">Sebastian Sebald</Text>
        <Text variant="muted" size="caption">
          Software Architect at Reservix, Freiburg
        </Text>
      </div>
      <Text>
        I work right where code meets user experience. At the core of this work
        sit design systems. They are the infrastructure that translates creative
        vision into reality at scale.
      </Text>
    </div>
  </header>
);

const NotesList = () => {
  const notes = sortByDate(notesSource.getPages());

  return (
    <section className="grid gap-6">
      <Headline level="2" as="h2">
        Notes
      </Headline>
      <ul className="grid gap-6">
        {notes.map(note => (
          <li key={note.url} className="grid gap-1">
            <Link href={note.url} className="group">
              <Headline level="2" as="h3">
                {note.data.title}
              </Headline>
            </Link>
            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              {note.data.date && (
                <time dateTime={String(note.data.date)}>
                  {new Date(note.data.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
            </div>
            <Text variant="muted">{excerpt(note)}</Text>
          </li>
        ))}
      </ul>
    </section>
  );
};

const HomePage = () => (
  <div className="grid gap-16 pt-32">
    <Intro />
    <NotesList />
  </div>
);

export default HomePage;
