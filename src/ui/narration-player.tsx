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

import { trackEvent } from '@/lib/analytics';
import { formatDuration } from '@/lib/string.utils';
import { cva } from '@/lib/styles.utils';
import { Button } from '@/ui/button';

// Config
// ---------------
const RATES = [1, 1.25, 1.5, 0.75] as const;
const SKIP_SECONDS = 15;

// Styles
// ---------------
const styles = {
  listen: cva({
    base: [
      // Same width for Listen, Pause and Resume, so the toolbar doesn't shift
      'h-11 w-auto min-w-28 gap-2 px-4.5',
      // Only the outer buttons hang into the margin
      'mx-0',
      'text-sm font-medium',
    ],
  }),
  bar: cva({
    base: [
      'ui-panel z-100',
      'fixed inset-x-4 bottom-4 mx-auto max-w-2xl',
      'grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2',
      'py-3 pr-3 pl-4 md:gap-x-5 md:pl-5',
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
    base: [
      '[grid-area:play]',
      'size-11 rounded-full bg-mist-100 text-mist-900',
      'hover:bg-mist-50 hover:text-mist-900',
      '[&_svg]:size-4.5',
    ],
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
      'mx-0 h-8 w-12 rounded-full',
      'text-xs font-medium tabular-nums text-mist-300',
      'hover:bg-mist-500/30 hover:text-mist-50',
    ],
  }),
  close: cva({
    base: [
      '[grid-area:close] justify-self-end',
      'mx-0 size-9 rounded-full text-mist-400',
      'hover:bg-mist-500/30 hover:text-mist-50',
      '[&_svg]:size-4',
    ],
  }),
};

// Props
// ---------------
export interface NarrationPlayerProps {
  /** URL of the narration, see `narrationUrl`. */
  src: string;
  /** Note title, shown in the bar and on the lock screen. */
  title: string;
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
 */
export const NarrationPlayer = ({ src, title }: NarrationPlayerProps) => {
  const audio = useRef<HTMLAudioElement>(null);
  const tracked = useRef(false);
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
    if (!tracked.current) {
      tracked.current = true;
      trackEvent('Listen');
    }
  };

  const toggle = () => (playing ? audio.current?.pause() : play());

  const seek = (seconds: number) => {
    const el = audio.current;
    if (!el) return;
    el.currentTime = Math.min(Math.max(seconds, 0), el.duration || seconds);
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

  // Keep the end of the note readable above the docked bar
  useEffect(() => {
    if (!open) return;
    document.body.style.paddingBottom = '7rem';
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, [open]);

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
      if (audio.current) audio.current.currentTime += seconds;
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
            audio.current.currentTime = seekTime;
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

  return (
    <>
      {/* Labelled, an icon alone doesn't say what will happen */}
      <Button variant="icon" onClick={toggle} className={styles.listen()}>
        {playing ? (
          <PauseIcon weight="bold" aria-hidden />
        ) : open ? (
          <PlayIcon weight="bold" aria-hidden />
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
        onEnded={() => setPlaying(false)}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
      />

      {open &&
        // Outside the toolbar, the bar is not part of its navigation
        createPortal(
          <section aria-label="Narration" className={styles.bar()}>
            <Button
              variant="icon"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={toggle}
              className={styles.play()}
            >
              {playing ? (
                <PauseIcon weight="fill" aria-hidden />
              ) : (
                <PlayIcon weight="fill" aria-hidden />
              )}
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
              variant="link"
              aria-label={`Playback speed ${rate}×`}
              onClick={cycleRate}
              className={styles.rate()}
            >
              {rate}×
            </Button>
            <Button
              variant="link"
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
