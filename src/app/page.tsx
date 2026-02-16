import { notesSource, sortByDate } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { Logo } from '@/ui/logo';
import { Text } from '@/ui/text';

export const Intro = () => (
  <header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
    <Logo size={50} />
    <div className="grid gap-8">
      <div className="grid gap-2.5">
        <Text variant="accent">Sebastian Sebald</Text>
        <Text variant="muted" size="caption">
          Software Architect at Reservix, Freiburg
        </Text>
      </div>
      <Text>
        I work at the intersection of code and user experience. Design systems
        are central to that work. They&apos;re the infrastructure that turns
        creative vision into something real, at scale.
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
      <Headline level="3">Notes</Headline>
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
  <div className="grid gap-28 pt-32">
    <Intro />
    <NotesList />
  </div>
);

export default HomePage;
