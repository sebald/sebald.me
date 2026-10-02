import { track } from '@vercel/analytics';

// Events
// ---------------
/**
 * Custom events sent to Vercel Web Analytics. Every event is recorded
 * together with the page it happened on, so properties only carry what
 * the URL doesn't (the Pro plan allows 2 per event).
 */
export interface AnalyticsEvents {
  Copy: { target: 'url' | 'code' };
  'View Markdown': undefined;
  'Outbound Link': { url: string };
  /**
   * `note` repeats the page URL on purpose: it lets the dashboard break
   * the event down across all notes in one list. Uses both property slots.
   */
  'Read Progress': {
    milestone: '25%' | '50%' | '75%' | '100%' | 'read';
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
