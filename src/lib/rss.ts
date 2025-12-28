import { Feed } from 'feed';
import { type InferPageType } from 'fumadocs-core/source';

import { type articlesSource, type labsSource } from '@/lib/source';

const baseUrl = 'https://sebald.me';

type PageType =
  | InferPageType<typeof articlesSource>
  | InferPageType<typeof labsSource>;

interface FeedConfig {
  title: string;
  id: string;
  link: string;
}

/**
 * Creates an RSS feed from pages
 * @param pages - Array of pages to include in the feed
 * @param config - Feed configuration (title, id, link)
 * @returns Response with RSS XML
 */
export function createRSSFeed(pages: PageType[], config: FeedConfig): Response {
  const feed = new Feed({
    title: config.title,
    id: config.id,
    link: config.link,
    language: 'en',
    copyright: `All rights reserved ${new Date().getFullYear()}, Sebastian Sebald`,
  });

  // Sort pages by date, most recent first
  const sortedPages = [...pages].sort((a, b) => {
    const dateA: number = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB: number = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });

  for (const page of sortedPages) {
    // Skip draft items
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
