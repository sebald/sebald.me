/**
 * The lab: things that are more code than prose. Games, demos and
 * interactive examples that a note can point to when it needs more than
 * text. One entry per folder under `src/app/(page)/lab/<slug>`.
 */
export interface LabEntry {
  slug: string;
  title: string;
  blurb: string;
  /** Slug of the note this entry belongs to, if any */
  note?: string;
}

export const LAB_ENTRIES: readonly LabEntry[] = [
  {
    slug: 'pushback',
    title: 'Pushback',
    blurb:
      'A duel of phrases and counters between the roles of a product team. Counter the phrase, push the scale, drop the mic.',
  },
];

export const labUrl = (entry: Pick<LabEntry, 'slug'>) => `/lab/${entry.slug}`;

export const labEntry = (slug: string): LabEntry | undefined =>
  LAB_ENTRIES.find(entry => entry.slug === slug);
