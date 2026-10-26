import { track } from '@vercel/analytics';

// Events
// ---------------
/** Progress points of `Read Progress` and `Listen Progress`. */
export const PROGRESS_MILESTONES = [25, 50, 75, 100] as const;
export type ProgressMilestone = `${(typeof PROGRESS_MILESTONES)[number]}%`;

/**
 * Custom events sent to Vercel Web Analytics. Every event is recorded
 * together with the page it happened on, so properties only carry what
 * the URL doesn't (the Pro plan allows 2 per event).
 */
export interface AnalyticsEvents {
  Copy: { target: 'url' | 'code' };
  'View Markdown': undefined;
  /** First play of a note's narration, `note` as in `Read Progress`. */
  Listen: { note: string };
  /**
   * Click on a hidden object in a pixel scene (see `src/lib/hotspots.ts`),
   * once per object and page view.
   */
  'Look At': { object: string };
  /**
   * Share of a note's narration that was actually played. Skipped parts
   * don't count, so seeking to the end doesn't send `100%`.
   */
  'Listen Progress': {
    milestone: ProgressMilestone;
    note: string;
  };
  'Outbound Link': { url: string };
  /**
   * `note` repeats the page URL on purpose: it lets the dashboard break
   * the event down across all notes in one list. Uses both property slots.
   */
  'Read Progress': {
    milestone: ProgressMilestone | 'read';
    note: string;
  };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

/**
 * Events without properties, these can be passed around by name
 * (e.g. from a server component as a prop).
 */
export type SimpleAnalyticsEventName = {
  [Name in AnalyticsEventName]: AnalyticsEvents[Name] extends undefined
    ? Name
    : never;
}[AnalyticsEventName];

export const trackEvent = <Name extends AnalyticsEventName>(
  name: Name,
  ...[properties]: AnalyticsEvents[Name] extends undefined
    ? []
    : [AnalyticsEvents[Name]]
) => track(name, properties);

// Helpers
// ---------------
/**
 * Whether a link leaves the site. Only web links count, `mailto:` and
 * friends are ignored.
 */
export const isOutboundUrl = (url: URL, origin: string) =>
  (url.protocol === 'https:' || url.protocol === 'http:') &&
  url.origin !== origin;

/**
 * Seconds of media that were played, from `HTMLMediaElement.played`. The
 * browser merges overlapping ranges, so listening twice counts once.
 */
export const playedSeconds = (
  played: Pick<TimeRanges, 'length' | 'start' | 'end'>,
) => {
  let total = 0;
  for (let i = 0; i < played.length; i++) {
    total += played.end(i) - played.start(i);
  }
  return total;
};

/**
 * Stopwatch that only runs while the page is visible. Time is passed in,
 * so it works with `performance.now()` and in tests.
 */
export const createVisibleClock = (now: number, visible: boolean) => {
  let total = 0;
  let since: number | undefined = visible ? now : undefined;

  return {
    setVisible: (visible: boolean, now: number) => {
      if (visible) {
        since ??= now;
      } else if (since !== undefined) {
        total += now - since;
        since = undefined;
      }
    },
    elapsed: (now: number) => total + (since === undefined ? 0 : now - since),
  };
};
