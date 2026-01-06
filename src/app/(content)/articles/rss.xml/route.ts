import { createRSSFeed } from '@/lib/rss';
import { articlesSource } from '@/lib/source';

export const revalidate = false;

export const GET = () =>
  createRSSFeed(articlesSource.getPages(), {
    title: 'Articles | sebald.me',
    description:
      'Articles about software development and design by Sebastian Sebald',
  });
