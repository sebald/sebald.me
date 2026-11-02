'use client';

import type { MouseEvent, PointerEvent } from 'react';

import { cn, cva } from '@/lib/styles.utils';

import { canPlay, toggleSound } from './audio/engine';
import { PALETTE } from './palette';
import { TALL_BAR, px, useStage } from './stage';
import { useInputKind } from './use-input-kind';
import { useSoundSettings } from './use-sound';

/**
 * The icons, pixel for pixel (at `DOT`), in yellow so they are found on
 * the dark room: an ink outline (`K`), lit on top (`Y`), gold (`G`), in
 * shade below (`O`). The speaker has two waves beside it (`W`), or a red
 * cross (`X`) when the sound is off.
 */
const ICONS = {
  soundOn: [
    '.........K......',
    '........KK...W..',
    '.......KYK....W.',
    '......KYYK.W...W',
    'KKKKKKYYGK..W..W',
    'KYYYYKYGGK..W..W',
    'KGGGGKGGGK..W..W',
    'KOOOOKGOOK..W..W',
    'KKKKKKOOOK..W..W',
    '......KOOK.W...W',
    '.......KOK....W.',
    '........KK...W..',
    '.........K......',
  ],
  soundOff: [
    '.........K......',
    '........KK......',
    '.......KYK......',
    '......KYYK......',
    'KKKKKKYYGK.X...X',
    'KYYYYKYGGK..X.X.',
    'KGGGGKGGGK...X..',
    'KOOOOKGOOK..X.X.',
    'KKKKKKOOOK.X...X',
    '......KOOK......',
    '.......KOK......',
    '........KK......',
    '.........K......',
  ],
  back: [
    '.....K.......',
    '....KYK......',
    '...KYGK......',
    '..KYGGKKKKKK.',
    '.KYGGGYYYYYYK',
    'KGGGGGGGGGGGK',
    '.KOGGGOOOOOOK',
    '..KOGGKKKKKK.',
    '...KOGK......',
    '....KOK......',
    '.....K.......',
  ],
  pause: [
    'KKKK..KKKK',
    'KYYK..KYYK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KGGK..KGGK',
    'KOOK..KOOK',
    'KKKK..KKKK',
  ],
} as const;

type Icon = keyof typeof ICONS;

/** A pixel of an icon in stage pixels, as fine as the stopwatch's */
const DOT = 2 / 3;

const COLOURS: Record<string, string> = {
  K: PALETTE.bg,
  Y: PALETTE.goldLight,
  G: PALETTE.gold,
  O: PALETTE.goldShade,
  W: PALETTE.goldLight,
  X: PALETTE.stamp,
};

/**
 * An icon at the stage's pixels, or at a size in CSS pixels on the tall
 * stage's bar, where the controls are sized for a thumb
 */
const PixelIcon = ({ icon, dot }: { icon: Icon; dot?: number }) => {
  const rows = ICONS[icon];
  const size = (n: number) =>
    dot === undefined ? px(n * DOT) : `${Math.round(n * dot)}px`;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
      className="block shrink-0"
      style={{ width: size(rows[0].length), height: size(rows.length) }}
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '.' ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={COLOURS[cell]}
            />
          ),
        ),
      )}
    </svg>
  );
};

// A tap on a control is not a tap that opens the title's menu, moves a
// duel on, leaves the demo or resets its clock
const keep = (event: PointerEvent | MouseEvent) => event.stopPropagation();

/** A control's click: its own, and nobody else's */
const only = (action: () => void) => (event: MouseEvent) => {
  event.stopPropagation();
  action();
};

const styles = {
  corner: cva({
    base: 'absolute z-30 cursor-pointer p-[calc(var(--px)*2)] outline-none hover:brightness-125 focus-visible:ui-focus',
  }),
  bar: cva({
    base: [
      'absolute inset-x-0 bottom-0 z-30 flex items-center justify-between px-2',
      'border-t border-(--pb-frame-dim) bg-(--pb-bg)',
    ],
  }),
  barButton: cva({
    base: [
      'flex min-h-11 min-w-11 cursor-pointer items-center gap-2 px-3 text-[0.85em] text-(--pb-muted)',
      'outline-none focus-visible:ui-focus active:text-(--pb-text-bright)',
    ],
  }),
};

/** What Escape does on a screen, as a button: step back, or pause the duel */
export interface Escape {
  kind: 'back' | 'pause';
  onPress: () => void;
}

const ESCAPE_LABELS = { back: 'Back', pause: 'Pause' } as const;

/**
 * The speaker in the top right corner of a wide stage: the music and the
 * effects on or off together (Options has each on its own). A tap on it
 * is the gesture the browser needs before anything can play. M does the
 * same on every screen (`useMuteKey`).
 */
export const SpeakerButton = () => {
  const sound = useSoundSettings();
  const on = sound.music || sound.effects;
  if (!canPlay()) return null;
  return (
    <button
      type="button"
      aria-label="Sound (M)"
      aria-pressed={on}
      className={styles.corner()}
      style={{ top: px(5), right: px(5) }}
      onPointerDown={keep}
      onClick={only(toggleSound)}
    >
      <PixelIcon icon={on ? 'soundOn' : 'soundOff'} />
    </button>
  );
};

interface ControlsProps {
  /** Escape's job on this screen, if it has one */
  escape?: Escape;
  /**
   * On a wide stage, Escape's button sits in the top left corner, or in
   * the middle of the top at this row (the duel, whose corners hold the
   * faces)
   */
  centreAt?: number;
  /**
   * The speaker on a wide stage: for touch only (the keyboard has M), on
   * every input (the title), or not at all (the duel: its pause menu has
   * the sound)
   */
  speaker?: 'touch' | 'always' | 'none';
}

/**
 * The touch versions of Escape and M. On the tall stage a bar along the
 * bottom, sized for a thumb: Back or Pause on the left, the sound on the
 * right. On a wide stage, for touch, small pixel buttons in the corners
 * (the keyboard has its keys, and the title its speaker either way).
 */
export const Controls = ({
  escape,
  centreAt,
  speaker = 'touch',
}: ControlsProps) => {
  const { tall } = useStage();
  const kind = useInputKind();
  const sound = useSoundSettings();
  const on = sound.music || sound.effects;

  if (tall) {
    return (
      <div className={styles.bar()} style={{ height: TALL_BAR }}>
        {escape ? (
          <button
            type="button"
            aria-label={`${ESCAPE_LABELS[escape.kind]} (Esc)`}
            className={styles.barButton()}
            onPointerDown={keep}
            onClick={only(escape.onPress)}
          >
            <PixelIcon icon={escape.kind} dot={1.5} />
            {ESCAPE_LABELS[escape.kind]}
          </button>
        ) : (
          <span />
        )}
        {canPlay() && (
          <button
            type="button"
            aria-label="Sound (M)"
            aria-pressed={on}
            className={styles.barButton()}
            onPointerDown={keep}
            onClick={only(toggleSound)}
          >
            {on ? 'Sound on' : 'Sound off'}
            <PixelIcon icon={on ? 'soundOn' : 'soundOff'} dot={1.5} />
          </button>
        )}
      </div>
    );
  }

  const touch = kind === 'touch';
  return (
    <>
      {escape && touch && (
        <button
          type="button"
          aria-label={`${ESCAPE_LABELS[escape.kind]} (Esc)`}
          className={cn(
            styles.corner(),
            centreAt !== undefined && '-translate-x-1/2',
          )}
          style={
            centreAt === undefined
              ? { top: px(5), left: px(5) }
              : { top: px(centreAt), left: '50%' }
          }
          onPointerDown={keep}
          onClick={only(escape.onPress)}
        >
          <PixelIcon icon={escape.kind} />
        </button>
      )}
      {(speaker === 'always' || (speaker === 'touch' && touch)) && (
        <SpeakerButton />
      )}
    </>
  );
};
