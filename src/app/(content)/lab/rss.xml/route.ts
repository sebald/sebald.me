import { createRSSFeed } from '@/lib/rss';
import { labSource } from '@/lib/source';

export const revalidate = false;

export const GET = () =>
  createRSSFeed(labSource.getPages(), {
    title: 'Lab | sebald.me',
    description: 'Experiments and projects by Sebastian Sebald',
  });
