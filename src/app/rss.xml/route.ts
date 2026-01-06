import { createRSSFeed } from '@/lib/rss';
import { articlesSource, labSource } from '@/lib/source';

export const revalidate = false;

export const GET = () => {
  const feed = createRSSFeed([
    ...articlesSource.getPages(),
    ...labSource.getPages(),
  ]);

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
