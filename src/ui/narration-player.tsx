'use client';

import { Slider } from '@base-ui/react/slider';
import {
  HeadphonesIcon,
  PauseIcon,
  PlayIcon,
  XIcon,
} from '@phosphor-icons/react/ssr';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ProgressMilestone } from '@/lib/analytics';
import {
  playedSeconds,
  PROGRESS_MILESTONES,
  trackEvent,
} from '@/lib/analytics';
import { formatDuration } from '@/lib/string.utils';
import { cva } from '@/lib/styles.utils';
import { Button } from '@/ui/button';

// Config
// ---------------
const RATES = [1, 1.25, 1.5, 0.75] as const;
const SKIP_SECONDS = 15;
/**
 * Share of the narration that may be missing for a milestone to count, the
 * played ranges can stop a fraction short of the end.
 */
const MILESTONE_TOLERANCE = 0.01;

// Helpers
// ---------------
/** Jumps to a position, clamped to the narration. */
const seekTo = (el: HTMLAudioElement, seconds: number) => {
  el.currentTime = Math.min(Math.max(seconds, 0), el.duration || seconds);
};

// Styles
// ---------------
const styles = {
  listen: cva({
    base: [
      // Same width for Listen, Pause and Resume, so the toolbar doesn't shift
      'h-11 w-auto min-w-28 gap-2 px-4.5',
      'text-sm font-medium',
    ],
  }),
  bar: cva({
    base: [
      'ui-panel z-100',
      'fixed inset-x-4 bottom-4 mx-auto max-w-2xl',
      'grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2',
      'py-3 pr-3 pl-3 md:gap-x-5 md:pl-4',
      // Close alone in the corner, speed next to the time it changes, so
      // close isn't hit by accident
      '[grid-template-areas:"play_title_close"_"play_progress_rate"]',
      // Slide in from below on open
      'transition-[translate,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
      'starting:translate-y-4 starting:opacity-0',
      'motion-reduce:transition-none',
    ],
  }),
  play: cva({
    base: ['[grid-area:play]', 'size-11 rounded-full px-0', '[&_svg]:size-4.5'],
  }),
  title: cva({
    base: [
      '[grid-area:title] min-w-0',
      'flex items-baseline gap-2.5',
      'text-sm text-mist-100',
    ],
  }),
  name: cva({
    base: ['truncate font-medium'],
  }),
  note: cva({
    base: ['shrink-0 text-xs text-mist-400'],
  }),
  progress: cva({
    base: [
      '[grid-area:progress] min-w-0',
      'flex items-center gap-3.5',
      'text-xs text-mist-400 tabular-nums',
    ],
  }),
  slider: cva({
    base: ['flex-1'],
  }),
  control: cva({
    base: ['flex h-5 w-full touch-none items-center select-none'],
  }),
  track: cva({
    base: ['h-1 w-full rounded-full bg-mist-500/40'],
  }),
  indicator: cva({
    base: ['rounded-full bg-mist-100'],
  }),
  thumb: cva({
    base: [
      'size-3 rounded-full bg-mist-50',
      'outline-none has-[:focus-visible]:ui-focus',
    ],
  }),
  rate: cva({
    base: [
      '[grid-area:rate] justify-self-end',
      'h-8 w-12',
      'text-xs font-medium tabular-nums text-mist-300',
    ],
  }),
  close: cva({
    base: ['[grid-area:close] justify-self-end', 'size-9'],
  }),
};

// Props
// ---------------
export interface NarrationPlayerProps {
  /** URL of the narration, see `narrationUrl`. */
  src: string;
  /** Note title, shown in the bar and on the lock screen. */
  title: string;
  /**
   * Sent with the `Listen` and `Listen Progress` events, usually the page
   * URL. Without it nothing is tracked (e.g. the inventory's example).
   */
  note?: string;
}

// Component
// ---------------
/**
 * Toolbar button that reads the note aloud. Pressing it docks a player bar
 * to the bottom of the screen, which stays while scrolling.
 *
 * The `<audio>` element uses `preload="none"`, so nothing is downloaded
 * until someone presses play. `play()` runs inside the click handler,
 * Safari refuses to start audio outside of one.
 *
 * Each event is sent once per mount, so give it a `key` to reset it
 * between notes.
 */
export const NarrationPlayer = ({ src, title, note }: NarrationPlayerProps) => {
  const audio = useRef<HTMLAudioElement>(null);
  // Events already sent, each one goes out once per mount
  const sent = useRef(new Set<'listen' | ProgressMilestone>());
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState<(typeof RATES)[number]>(1);

  const play = () => {
    const el = audio.current;
    if (!el) return;
    setOpen(true);
    el.play().catch(() => setPlaying(false));
    if (note && !sent.current.has('listen')) {
      sent.current.add('listen');
      trackEvent('Listen', { note });
    }
  };

  // Based on what was played, not on the position, so seeking doesn't count
  const trackProgress = (el: HTMLAudioElement) => {
    if (!note || !el.duration || sent.current.has('100%')) return;
    const share = playedSeconds(el.played) / el.duration;
    for (const pct of PROGRESS_MILESTONES) {
      const milestone: ProgressMilestone = `${pct}%`;
      if (share < pct / 100 - MILESTONE_TOLERANCE) break;
      if (sent.current.has(milestone)) continue;
      sent.current.add(milestone);
      trackEvent('Listen Progress', { milestone, note });
    }
  };

  const toggle = () => (playing ? audio.current?.pause() : play());

  const seek = (seconds: number) => {
    const el = audio.current;
    if (!el) return;
    seekTo(el, seconds);
    setTime(el.currentTime);
  };

  const close = () => {
    audio.current?.pause();
    setOpen(false);
  };

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    if (audio.current) audio.current.playbackRate = next;
    setRate(next);
  };

  // Lock screen, media keys and headphone buttons
  useEffect(() => {
    if (!open || !('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({
      title,
      artist: 'Sebastian Sebald',
      album: 'sebald.me',
    });
    // `timeupdate` keeps the displayed time in sync after these
    const skip = (seconds: number) => () => {
      if (audio.current)
        seekTo(audio.current, audio.current.currentTime + seconds);
    };
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => audio.current?.play()],
      ['pause', () => audio.current?.pause()],
      ['seekbackward', skip(-SKIP_SECONDS)],
      ['seekforward', skip(SKIP_SECONDS)],
      [
        'seekto',
        ({ seekTime }) => {
          if (audio.current && seekTime !== undefined)
            seekTo(audio.current, seekTime);
        },
      ],
    ];
    for (const [action, handler] of handlers) {
      session.setActionHandler(action, handler);
    }
    return () => {
      session.metadata = null;
      for (const [action] of handlers) session.setActionHandler(action, null);
    };
  }, [open, title]);

  const ToggleIcon = playing ? PauseIcon : PlayIcon;

  return (
    <>
      {/* Labelled, an icon alone doesn't say what will happen */}
      <Button variant="icon" onClick={toggle} className={styles.listen()}>
        {open ? (
          <ToggleIcon weight="bold" aria-hidden />
        ) : (
          <HeadphonesIcon weight="bold" aria-hidden />
        )}
        {playing ? 'Pause' : open ? 'Resume' : 'Listen'}
      </Button>

      {/* The note on the page is the transcript */}
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={e => {
          setPlaying(false);
          trackProgress(e.currentTarget);
        }}
        onTimeUpdate={e => {
          setTime(e.currentTarget.currentTime);
          trackProgress(e.currentTarget);
        }}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
      />

      {open &&
        // Outside the toolbar, the bar is not part of its navigation
        createPortal(
          <section
            aria-label="Narration"
            // The layout reserves space for it at the end of the page
            data-narration-bar
            className={styles.bar()}
          >
            <Button
              variant="primary"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={toggle}
              className={styles.play()}
            >
              <ToggleIcon weight="fill" aria-hidden />
            </Button>

            <p className={styles.title()}>
              <span className={styles.name()}>{title}</span>
              <span className={styles.note()}>AI voice</span>
            </p>

            <div className={styles.progress()}>
              <span>{formatDuration(time)}</span>
              <Slider.Root
                className={styles.slider()}
                value={time}
                min={0}
                max={duration || 1}
                step={1}
                largeStep={SKIP_SECONDS}
                onValueChange={value => seek(value)}
                disabled={!duration}
              >
                <Slider.Control className={styles.control()}>
                  <Slider.Track className={styles.track()}>
                    <Slider.Indicator className={styles.indicator()} />
                    <Slider.Thumb
                      className={styles.thumb()}
                      getAriaLabel={() => 'Position'}
                      getAriaValueText={(_, value) =>
                        `${formatDuration(value)} of ${formatDuration(duration)}`
                      }
                    />
                  </Slider.Track>
                </Slider.Control>
              </Slider.Root>
              <span>{duration ? formatDuration(duration) : '–:––'}</span>
            </div>

            <Button
              variant="ghost"
              aria-label={`Playback speed ${rate}×`}
              onClick={cycleRate}
              className={styles.rate()}
            >
              {rate}×
            </Button>
            <Button
              variant="ghost"
              aria-label="Close player"
              onClick={close}
              className={styles.close()}
            >
              <XIcon weight="bold" aria-hidden />
            </Button>
          </section>,
          document.body,
        )}
    </>
  );
};
