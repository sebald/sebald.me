import { createRSSFeed } from '@/lib/rss';
import { articlesSource } from '@/lib/source';

// Config
// ---------------
export const revalidate = false;

// Route
// ---------------
export const GET = () => {
  const feed = createRSSFeed(articlesSource.getPages(), {
    title: 'Articles | sebald.me',
    description:
      'Articles about software development and design by Sebastian Sebald',
  });

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
