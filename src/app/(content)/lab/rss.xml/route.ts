import { createRSSFeed } from '@/lib/rss';
import { labSource } from '@/lib/source';

// Config
// ---------------
export const revalidate = false;

// Route
// ---------------
export const GET = () =>
  createRSSFeed(labSource.getPages(), {
    title: 'Lab | sebald.me',
    description: 'Experiments and projects by Sebastian Sebald',
  });
