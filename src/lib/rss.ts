import { Feed } from 'feed';

import { siteUrl } from '@/app.config';
import { type ContentPage, excerpt, sortByDate } from '@/lib/source';

interface CreateRSSFeedConfig {
  title?: string;
  description?: string;
}

export const createRSSFeed = (
  pages: ContentPage[],
  config?: CreateRSSFeedConfig,
) => {
  const feed = new Feed({
    title: config?.title ?? 'sebald.me',
    description:
      config?.description ?? 'Personal blog and portfolio of Sebastian Sebald',
    id: siteUrl,
    link: siteUrl,
    language: 'en',
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Sebastian Sebald`,
    updated: new Date(),
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
    author: {
      name: 'Sebastian Sebald',
      email: 'sebastian.sebald@gmail.com',
      link: siteUrl,
    },
  });

  sortByDate(pages).forEach(page => {
    if (page.data.draft) return;

    feed.addItem({
      title: page.data.title,
      id: page.url,
      link: `${siteUrl}${page.url}`,
      date: page.data.date ? new Date(page.data.date) : new Date(),
      content: excerpt(page, 200),
    });
  });

  return feed.rss2();
};
