import { notesSource, sortByDate } from '@/lib/source';
import { HomeHeader } from '@/ui/home-header';
import { NotesList } from '@/ui/notes-list';

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
