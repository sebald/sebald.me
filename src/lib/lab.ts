import type { BentoLayout } from '@/ui/bento';

/**
 * The lab: things that are more code than prose. Games, demos and
 * interactive examples that a note can point to when it needs more than
 * text. One entry per folder under `src/app/(page)/lab/<slug>`.
 */
export interface LabEntry {
  slug: string;
  title: string;
  blurb: string;
  /**
   * The pictures under the title on the home page: a bento layout and its
   * four tiles in reading order, under `public/`, each cut to its cell
   */
  bento?: { layout: BentoLayout; tiles: readonly string[] };
  /** Slug of the note this entry belongs to, if any */
  note?: string;
}

export const LAB_ENTRIES: readonly LabEntry[] = [
  {
    slug: 'pushback',
    title: 'Pushback',
    blurb:
      'A duel of comebacks, inspired by the insult sword fights in Monkey Island. Play a PM, Dev or Designer, out-talk three colleagues and then the Stakeholder. An experiment in how far you get vibe coding a whole game with Claude, pixel art included.',
    bento: {
      layout: 'four-piece',
      tiles: [
        '/home/pushback-tile-scene.webp',
        '/home/pushback-tile-wordmark.webp',
        '/home/pushback-tile-roles.webp',
        '/home/pushback-tile-title-menu.webp',
      ],
    },
  },
];

export const labUrl = (entry: Pick<LabEntry, 'slug'>) => `/lab/${entry.slug}`;

export const labEntry = (slug: string): LabEntry | undefined =>
  LAB_ENTRIES.find(entry => entry.slug === slug);
