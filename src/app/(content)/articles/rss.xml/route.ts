import { createRSSFeed } from '@/lib/rss';
import { articlesSource } from '@/lib/source';

export const revalidate = false;

export function GET() {
  const pages = articlesSource.getPages();

  return createRSSFeed(pages, {
    title: 'Sebastian Sebald - Articles',
    id: 'https://sebald.me/articles',
    link: 'https://sebald.me/articles',
  });
}
