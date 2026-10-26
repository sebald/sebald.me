import { statSync } from 'node:fs';
import { join } from 'node:path';

import { siteUrl } from '@/app.config';
import { narrationUrl } from '@/lib/narration';
import { type Episode, podcastFeed } from '@/lib/podcast';
import { notesSource, sortByDate } from '@/lib/source';

// Config
// ---------------
export const revalidate = false;

// Route
// ---------------
export const GET = () => {
  const episodes = sortByDate([...notesSource.getPages()]).flatMap(
    (page): Episode[] => {
      const audio = narrationUrl(page.slugs);
      if (page.data.draft || !audio) return [];

      return [
        {
          title: page.data.title,
          description: page.data.description ?? '',
          url: page.url,
          audio,
          bytes: statSync(join(process.cwd(), 'public', audio)).size,
          date: page.data.date ? new Date(page.data.date) : new Date(),
        },
      ];
    },
  );

  const feed = podcastFeed(
    {
      title: 'Sebastian Sebald, read aloud',
      description:
        'Narrated notes on modernizing long-lived software, design systems and building products around the people who use them. Read by a synthetic voice.',
      author: 'Sebastian Sebald',
      email: 'sebastian.sebald@gmail.com',
      image: '/audio.png',
    },
    episodes,
    siteUrl,
  );

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
