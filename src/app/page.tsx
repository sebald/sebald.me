import { notesSource, sortByDate } from '@/lib/source';
import { Logo } from '@/ui/logo';
import { NotesList } from '@/ui/notes-list';
import { Text } from '@/ui/text';

export const HomeHeader = () => {
  return (
    <header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
      <Logo size={32} />
      <div className="grid gap-8">
        <div className="grid gap-2">
          <Text variant="accent">Sebastian Sebald</Text>
          <Text variant="muted" size="caption">
            Software Architect at Reservix, Freiburg
          </Text>
        </div>
        <Text>
          I am a software architect at Reservix based in Freiburg, Germany. I
          specialize in design engineering, working right where code meets user
          experience.
        </Text>
      </div>
    </header>
  );
};

const HomePage = () => {
  const notes = sortByDate(notesSource.getPages());

  return (
    <div className="grid gap-16 pt-32">
      <HomeHeader />
      <NotesList notes={notes} />
    </div>
  );
};

export default HomePage;
