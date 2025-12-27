import { Feed } from 'feed';

import { articlesSource } from '@/lib/source';

export const revalidate = false;

const baseUrl = 'https://sebald.me';

export function GET() {
  const feed = new Feed({
    title: 'Sebastian Sebald - Articles',
    id: `${baseUrl}/articles`,
    link: `${baseUrl}/articles`,
    language: 'en',
    copyright: 'All rights reserved 2025, Sebastian Sebald',
  });

  const pages = articlesSource.getPages();

  // Sort pages by date, most recent first
  const sortedPages = [...pages].sort((a, b) => {
    const dateA: number = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB: number = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });

  for (const page of sortedPages) {
    // Skip draft articles
    if (page.data.draft) {
      continue;
    }

    feed.addItem({
      id: page.url,
      title: page.data.title,
      description: page.data.description ?? '',
      link: `${baseUrl}${page.url}`,
      date: page.data.date ? new Date(page.data.date) : new Date(),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
