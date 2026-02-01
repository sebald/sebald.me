import { notesSource, sortByDate } from '@/lib/source';
import { Logo } from '@/ui/logo';
import { GlitchInvader } from '@/ui/logo-signal-loss';
import { NotesList } from '@/ui/notes-list';
import { Text } from '@/ui/text';

export const HomeHeader = () => {
  return (
    <header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
      <Logo size={52} />
      <div className="grid gap-8">
        <div className="grid gap-2">
          <Text variant="accent">Sebastian Sebald</Text>
          <Text variant="muted" size="caption">
            Software Architect at Reservix, Freiburg
          </Text>
        </div>
        <Text>
          I work right where code meets user experience. At the core of this
          work sit design systems. They are the infrastructure that translates
          creative vision into reality at scale.
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
      <GlitchInvader size={50} />
      <NotesList notes={notes} />
    </div>
  );
};

export default HomePage;
