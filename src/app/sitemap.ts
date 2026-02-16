import type { MetadataRoute } from 'next';

import { siteUrl } from '@/app.config';
import { miscSource, notesSource } from '@/lib/source';

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const notes = notesSource.getPages().map(page => ({
    url: `${siteUrl}${page.url}`,
    lastModified: page.data.date ? new Date(page.data.date) : undefined,
  }));

  const misc = miscSource.getPages().map(page => ({
    url: `${siteUrl}${page.url}`,
  }));

  return [{ url: siteUrl, lastModified: new Date() }, ...notes, ...misc];
};

export default sitemap;
