'use client';

import type { CSSProperties } from 'react';

import { cn } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { px } from './stage';

/**
 * The phases, as the share of the time left: light blue while a counter
 * still counts as fast (the first half), then ember, then red for the
 * last quarter
 */
const FAST = 0.5;
const LATE = 0.25;

/** The blink once the fast half is gone: there, gone, a beat each */
const BLINK = '0.5s';

/**
 * The stopwatch, pixel for pixel (at `DOT`), in an ink outline (`K`) like the
 * characters' but darker, so it holds against the window's blue: a wide
 * gold crown on a short stem (`Y` lit, `W` its glint, `G` gold, `O`
 * shade), a red case so it is seen at once, lit on the upper left like
 * the window's frame (`L` lit, `C` case, `D` shade) with a dark rim inside
 * (`R`), and the white face (`F`) sunk in it, its top and left edge in the
 * rim's shadow (`S`), where the time left is a wedge. On the face the
 * hand at twelve (`H`) on its pin (`P`), and dots for the hours (`T`) at
 * twelve, three, six and nine; past the one at six a counter no longer
 * counts as fast.
 */
const WATCH = [
  '.......KKKKK.......',
  '......KYWGGGK......',
  '......KOOGGGK......',
  '.......KOOOK.......',
  '........KOK........',
  '.......KKKKK.......',
  '.....KKLLLLLKK.....',
  '....KLLRRRRRCCK....',
  '...KLRRSSSSSRRCK...',
  '..KLRSSFFTFFSFRCK..',
  '.KLRSFFFFFFFFFFRCK.',
  '.KLRSFFFFHFFFFFRCK.',
  'KLRSFFFFFHFFFFFFRDK',
  'KLRSFFFFFHFFFFFFRDK',
  'KLRSTFFFHPFFFFTFRDK',
  'KLRSFFFFFFFFFFFFRDK',
  'KLRSFFFFFFFFFFFFRDK',
  '.KCRSFFFFFFFFFFRDK.',
  '.KCRFFFFFFFFFFFRDK.',
  '..KCRFFFFTFFFFRDK..',
  '...KCRRFFFFFRRDK...',
  '....KCCRRRRRDDK....',
  '.....KKDDDDDKK.....',
];

/**
 * A pixel of the watch in stage pixels: finer than the stage's grid, the
 * way the faces in the bars are drawn, two screen pixels at 3x
 */
const DOT = 2 / 3;

/** The stopwatch's box in stage pixels, for the room kept beside it */
export const SILENCE_CLOCK = {
  width: WATCH[0]!.length * DOT,
  height: WATCH.length * DOT,
} as const;

/** The face's centre, the pin */
const PIN = { x: 9, y: 14 } as const;

const COLOURS: Record<string, string> = {
  K: PALETTE.bg,
  Y: PALETTE.goldLight,
  W: PALETTE.spark,
  G: PALETTE.gold,
  O: PALETTE.goldShade,
  L: PALETTE.stampLight,
  C: PALETTE.stamp,
  D: PALETTE.stampShade,
  R: PALETTE.stampRim,
  H: PALETTE.ink,
  P: PALETTE.ink,
  T: PALETTE.ink,
};

/** The map's pixels, each face pixel with its angle clockwise from twelve */
const PIXELS = WATCH.flatMap((row, y) =>
  [...row].flatMap((cell, x) =>
    cell === '.'
      ? []
      : [
          {
            x,
            y,
            cell,
            angle: (Math.atan2(x - PIN.x, PIN.y - y) / (Math.PI * 2) + 1) % 1,
          },
        ],
  ),
);

/** Light blue, ember, red, and each in the rim's shadow */
const colourOf = (share: number) =>
  share > FAST
    ? { main: PALETTE.time, shade: PALETTE.timeShade }
    : share > LATE
      ? { main: PALETTE.ember, shade: PALETTE.emberShade }
      : { main: PALETTE.stamp, shade: PALETTE.stampShade };

export interface SilenceTimerProps {
  elapsed: number;
  limit: number;
  /** No blink */
  still?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The silence bar as a stopwatch in the dialogue window's top right
 * corner while the defender picks a counter, the meeting timer of the
 * office: the time left a wedge shrinking clockwise from twelve, so the
 * fast half is gone when it passes the dot at six. Drawn pixel for
 * pixel (`WATCH`), a red case so it is seen, the face white like a
 * meeting timer's. Light blue while a counter still counts as fast, so
 * it stands out from the gold of the window's text; once that half has
 * run out the watch blinks the way the demo label does, there and gone,
 * the wedge staying so the time left can still be read, ember, then red
 * for the last quarter. Under reduced motion it
 * does not blink. Position it from outside.
 */
export const SilenceTimer = ({
  elapsed,
  limit,
  still = false,
  className,
  style,
}: SilenceTimerProps) => {
  const share = Math.max(0, Math.min(1, 1 - elapsed / limit));
  // Something you notice, not only a colour: the fast half gone
  const blinking = share <= FAST && !still;
  const fill = colourOf(share);
  const pixels = PIXELS.map(({ x, y, cell, angle }) => {
    const face = cell === 'F' || cell === 'S';
    const wedge = face && angle >= 1 - share;
    const colour = !face
      ? COLOURS[cell]
      : wedge
        ? cell === 'S'
          ? fill.shade
          : fill.main
        : cell === 'S'
          ? PALETTE.paperShade
          : PALETTE.paper;
    return { x, y, wedge, colour };
  });
  const rects = (wedge: boolean) =>
    pixels
      .filter(pixel => pixel.wedge === wedge)
      .map(({ x, y, colour }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={colour}
        />
      ));
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${WATCH[0]!.length} ${WATCH.length}`}
      shapeRendering="crispEdges"
      className={cn('block', className)}
      style={{
        width: px(SILENCE_CLOCK.width),
        height: px(SILENCE_CLOCK.height),
        ...style,
      }}
    >
      {/* The watch blinks, the time left on it stays */}
      <g
        className={cn(
          blinking &&
            'animate-arcade-blink [--blink-low:0] motion-reduce:animate-none',
        )}
        style={{ animationDuration: BLINK }}
      >
        {rects(false)}
      </g>
      <g>{rects(true)}</g>
    </svg>
  );
};
