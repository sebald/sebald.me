import { createRSSFeed } from '@/lib/rss';
import { labSource, notesSource } from '@/lib/source';

// Config
// ---------------
export const revalidate = false;

// Route
// ---------------
export const GET = () => {
  const feed = createRSSFeed([
    ...notesSource.getPages(),
    ...labSource.getPages(),
  ]);

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
