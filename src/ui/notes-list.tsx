import type { ContentPage } from '@/lib/source';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { Text } from '@/ui/text';

interface NotesListProps {
  notes: ContentPage[];
}

export const NotesList = ({ notes }: NotesListProps) => {
  return (
    <section className="grid gap-6">
      <Headline level="2" as="h2">
        Recent Notes
      </Headline>
      <ul className="grid gap-6">
        {notes.map(note => (
          <li key={note.url} className="grid gap-1">
            <Link href={note.url} className="group">
              <Headline level="3" as="h3" className="text-lg">
                {note.data.title}
              </Headline>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {note.data.date && (
                <time dateTime={String(note.data.date)}>
                  {new Date(note.data.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
              {note.data.topics && note.data.topics.length > 0 && (
                <span className="flex gap-2">
                  {note.data.topics.map(topic => (
                    <span
                      key={topic}
                      className="rounded-md bg-mist-800/50 px-2 py-0.5 text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </span>
              )}
            </div>
            {note.data.description && (
              <Text variant="muted" as="span">
                {note.data.description}
              </Text>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
