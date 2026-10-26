import { siteUrl } from '@/app.config';

/**
 * `JSON.stringify` for a `<script type="application/ld+json">`. Escapes `<`,
 * so a value can never close the script tag.
 */
export const serializeJsonLd = (data: object) =>
  JSON.stringify(data).replace(/</g, '\\u003c');

interface ArticleJsonLdInput {
  title: string;
  description: string;
  /** Path of the note, e.g. `/notes/slug` */
  url: string;
  /** Path of the link preview image */
  image: string;
  date?: Date | string;
}

/**
 * Structured data for a note, so search engines know its title, author,
 * date and image
 */
export const articleJsonLd = (
  { title, description, url, image, date }: ArticleJsonLdInput,
  base: string = siteUrl,
) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description,
  url: new URL(url, base).href,
  mainEntityOfPage: new URL(url, base).href,
  image: new URL(image, base).href,
  datePublished: date ? new Date(date).toISOString().split('T')[0] : undefined,
  author: {
    '@type': 'Person',
    name: 'Sebastian Sebald',
    url: base,
  },
});
