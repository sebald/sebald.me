import { createRSSFeed } from '@/lib/rss';
import { labSource } from '@/lib/source';

export const revalidate = false;

export function GET() {
  const pages = labSource.getPages();

  return createRSSFeed(pages, {
    title: 'Sebastian Sebald - Lab',
    id: 'https://sebald.me/lab',
    link: 'https://sebald.me/lab',
  });
}
