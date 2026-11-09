/**
 * The lab: things that are more code than prose. Games, demos and
 * interactive examples that a note can point to when it needs more than
 * text. One entry per folder under `src/app/(page)/lab/<slug>`.
 */
export interface LabEntry {
  slug: string;
  title: string;
  blurb: string;
  /** Three pictures for the home page's bento, large first, under `public/` */
  images?: readonly string[];
  /** Slug of the note this entry belongs to, if any */
  note?: string;
}

export const LAB_ENTRIES: readonly LabEntry[] = [
  {
    slug: 'pushback',
    title: 'Pushback',
    blurb:
      'A duel of phrases and counters between the roles of a product team. Counter the phrase, push the scale, drop the mic.',
    images: [
      '/home/pushback-duel.webp',
      '/home/pushback-result.webp',
      '/home/pushback-title.webp',
    ],
  },
];

export const labUrl = (entry: Pick<LabEntry, 'slug'>) => `/lab/${entry.slug}`;

export const labEntry = (slug: string): LabEntry | undefined =>
  LAB_ENTRIES.find(entry => entry.slug === slug);
