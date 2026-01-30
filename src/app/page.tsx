import { notesSource, sortByDate } from '@/lib/source';
import { Logo } from '@/ui/logo';
import { NotesList } from '@/ui/notes-list';
import { Text } from '@/ui/text';

export const HomeHeader = () => {
  return (
    <header className="grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-12">
      <Logo size={24} />
      <div className="grid gap-8">
        <Text>
          Hi, my name is Sebastian. I am a software architect at Reservix in
          Freiburg, Germany. I specialize in design engineering, working right
          where code meets user experience.
        </Text>
        <Text>
          My goal is to create digital products that are accessible, intuitive,
          and delightful. Design systems are central to this approach. They are
          the infrastructure that translates creative vision into reality at
          scale.
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
