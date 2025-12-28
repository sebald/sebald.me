import { createRSSFeed } from '@/lib/rss';
import { labsSource } from '@/lib/source';

export const revalidate = false;

export function GET() {
  const pages = labsSource.getPages();

  return createRSSFeed(pages, {
    title: 'Sebastian Sebald - Labs',
    id: 'https://sebald.me/labs',
    link: 'https://sebald.me/labs',
  });
}
