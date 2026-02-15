import { createRSSFeed } from '@/lib/rss';
import { notesSource } from '@/lib/source';

// Config
// ---------------
export const revalidate = false;

// Route
// ---------------
export const GET = () => {
  const feed = createRSSFeed([...notesSource.getPages()]);

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
