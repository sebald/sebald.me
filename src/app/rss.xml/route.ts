import { createRSSFeed } from '@/lib/rss';
import { articlesSource, labsSource } from '@/lib/source';

export const revalidate = false;

export function GET() {
  const articlesPages = articlesSource.getPages();
  const labsPages = labsSource.getPages();

  // Combine all pages
  const allPages = [...articlesPages, ...labsPages];

  return createRSSFeed(allPages, {
    title: 'Sebastian Sebald',
    id: 'https://sebald.me',
    link: 'https://sebald.me',
  });
}
