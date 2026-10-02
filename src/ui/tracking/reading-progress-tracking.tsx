'use client';

import { type PropsWithChildren, useEffect, useRef } from 'react';

import type { AnalyticsEvents } from '@/lib/analytics';
import { createVisibleClock, trackEvent } from '@/lib/analytics';

// Config
// ---------------
const MILESTONES = [25, 50, 75, 100] as const;

/**
 * Share of the estimated reading time that has to pass (with the tab
 * visible) before reaching the end counts as "read".
 */
const MIN_READ_FACTOR = 0.5;

type Milestone = AnalyticsEvents['Read Progress']['milestone'];

// Component
// ---------------
export interface ReadingProgressTrackingProps extends PropsWithChildren {
  /** Sent with every event, usually the page URL. */
  note: string;
  /** Estimated reading time in minutes. */
  minutes: number;
}

/**
 * Tracks how far people get in a note. Sends `25%` to `100%` when that
 * point of the content comes into view, and `read` once the end is reached
 * and at least half the reading time was spent with the tab visible.
 * `100%` alone also counts people who jump straight to the end.
 *
 * Wrap it *around* `Article.Content`, never inside: `.prose` styles its
 * direct children, so the markers have to be siblings of it. Each event is
 * sent once per mount, so give it a `key` to reset it between notes.
 */
export const ReadingProgressTracking = ({
  note,
  minutes,
  children,
}: ReadingProgressTrackingProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const minReadMs = minutes * 60_000 * MIN_READ_FACTOR;
    const isVisible = () => document.visibilityState === 'visible';
    const clock = createVisibleClock(performance.now(), isVisible());
    const sent = new Set<Milestone>();
    let endReached = false;
    let readTimer: ReturnType<typeof setTimeout> | undefined;

    const send = (milestone: Milestone) => {
      if (sent.has(milestone)) return;
      sent.add(milestone);
      trackEvent('Read Progress', { milestone, note });
    };

    // Wait for the remaining visible time, the timer pauses while hidden
    const checkRead = () => {
      clearTimeout(readTimer);
      readTimer = undefined;
      if (!endReached || sent.has('read') || !isVisible()) return;

      const remaining = minReadMs - clock.elapsed(performance.now());
      if (remaining <= 0) send('read');
      else readTimer = setTimeout(checkRead, remaining);
    };

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const pct = (entry.target as HTMLElement).dataset.milestone;
        send(`${pct}%` as Milestone);
        observer.unobserve(entry.target);

        if (pct === '100') {
          endReached = true;
          checkRead();
        }
      }
    });
    el.querySelectorAll(':scope > [data-milestone]').forEach(marker =>
      observer.observe(marker),
    );

    const handleVisibility = () => {
      clock.setVisible(isVisible(), performance.now());
      checkRead();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      clearTimeout(readTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [note, minutes]);

  return (
    <div ref={ref} className="relative">
      {children}
      {MILESTONES.map(pct => (
        <span
          key={pct}
          data-milestone={pct}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 size-px"
          // Keeps the 100% marker inside the box
          style={{ top: `calc(${pct}% - 1px)` }}
        />
      ))}
    </div>
  );
};
