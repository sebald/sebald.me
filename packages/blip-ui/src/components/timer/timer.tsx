'use client';

import { useEffect, type CSSProperties, type SVGAttributes } from 'react';

import { px } from '../../foundations/pixel';
import { useFeedback } from '../../providers/feedback';
import { cn } from '../../utils/styles';
import { timer } from './timer.styles';

/** The blink once the fast part is gone: there, gone, a beat each (ms) */
const BLINK_MS = 500;

/**
 * The stopwatch, pixel for pixel, in an ink outline (`K`, the ground, so
 * it holds against a window): a wide primary crown on a short stem (`Y`
 * lit, `W` its glint, `G` the colour, `O` shade), a danger-coloured case
 * so it is seen at once, lit on the upper left like a window's frame (`L`
 * lit, `C` case, `D` shade) with a dark rim inside (`R`), and the paper
 * face (`F`) sunk in it, its top and left edge in the rim's shadow (`S`),
 * where the time left is a wedge. On the face the hand at twelve (`H`)
 * on its pin (`P`), and dots for the hours (`T`) at twelve, three, six
 * and nine.
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

/** A pixel of the watch in stage pixels, finer than the stage's grid */
const DOT = 2 / 3;

/** The watch's box in stage pixels, for the room kept beside it */
export const TIMER_SIZE = {
  width: WATCH[0]!.length * DOT,
  height: WATCH.length * DOT,
} as const;

/** The face's centre, the pin */
const PIN = { x: 9, y: 14 } as const;

const COLOURS: Record<string, string> = {
  K: 'var(--bui-ground)',
  Y: 'var(--bui-primary-light)',
  W: 'var(--bui-spark)',
  G: 'var(--bui-primary)',
  O: 'var(--bui-primary-shade)',
  L: 'var(--bui-danger-light)',
  C: 'var(--bui-danger)',
  D: 'var(--bui-danger-shade)',
  R: 'var(--bui-danger-rim)',
  H: 'var(--bui-ink)',
  P: 'var(--bui-ink)',
  T: 'var(--bui-ink)',
};

/** The map's pixels, each with its angle clockwise from twelve */
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

export interface TimerProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  'children'
> {
  /** The whole time, in milliseconds */
  duration: number;
  /** The time left, in milliseconds; the wedge shows its share of `duration` */
  remaining: number;
  /**
   * The share of the time left at which it is no longer fast: the wedge
   * turns secondary and, unless paused, the watch starts to blink
   * @default 0.5
   */
  warnAt?: number;
  /**
   * The share of the time left at which it turns danger
   * @default 0.25
   */
  criticalAt?: number;
  /**
   * No blink and no sound, the wedge stays
   * @default false
   */
  paused?: boolean;
  /**
   * Play sounds: a `ping` when the fast part runs out, then a `tick` with
   * every blink (and with the blink's beat under reduced motion)
   * @default false
   */
  sound?: boolean;
  style?: CSSProperties;
}

/**
 * A pixel stopwatch whose face is a wedge of the time left, shrinking
 * clockwise from twelve. Info while there is plenty of time, secondary
 * once the fast part is gone, danger for the last quarter. From the first
 * change on it blinks, there and gone, so it is noticed and not only a
 * colour; the wedge stays so the time left can still be read. Under
 * reduced motion it does not blink. It is controlled: you own the clock,
 * and feed it `remaining`. Position it from outside.
 */
export const Timer = ({
  duration,
  remaining,
  warnAt = 0.5,
  criticalAt = 0.25,
  paused = false,
  sound = false,
  className,
  style,
  ...props
}: TimerProps) => {
  const play = useFeedback();
  const share = Math.max(
    0,
    Math.min(1, duration > 0 ? remaining / duration : 0),
  );
  const phase =
    share > warnAt ? 'fast' : share > criticalAt ? 'warning' : 'critical';
  const blinking = phase !== 'fast' && !paused;
  // Which blink it is on since the fast part ran out, -1 before
  const beat =
    phase === 'fast'
      ? -1
      : Math.max(
          0,
          Math.floor(
            (duration * (1 - share) - duration * (1 - warnAt)) / BLINK_MS,
          ),
        );
  useEffect(() => {
    if (sound && !paused && beat >= 0) play(beat === 0 ? 'ping' : 'tick');
  }, [sound, paused, beat, play]);

  const fill = timer.phase[phase];
  const pixels = PIXELS.map(({ x, y, cell, angle }) => {
    const face = cell === 'F' || cell === 'S';
    const wedge = face && angle >= 1 - share;
    const colour = !face
      ? COLOURS[cell]!
      : wedge
        ? cell === 'S'
          ? fill.shade
          : fill.main
        : cell === 'S'
          ? 'var(--bui-paper-shade)'
          : 'var(--bui-paper)';
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
          style={{ fill: colour }}
        />
      ));
  const seconds = Math.ceil(Math.max(0, remaining) / 1000);
  return (
    <svg
      role="timer"
      aria-label={`${seconds} seconds left`}
      data-phase={phase}
      viewBox={`0 0 ${WATCH[0]!.length} ${WATCH.length}`}
      shapeRendering="crispEdges"
      className={cn(timer.root(), className)}
      style={{
        width: px(TIMER_SIZE.width),
        height: px(TIMER_SIZE.height),
        ...style,
      }}
      {...props}
    >
      {/* The watch blinks, the time left on it stays */}
      <g
        className={timer.watch({ blinking })}
        style={{ animationDuration: `${BLINK_MS}ms` }}
      >
        {rects(false)}
      </g>
      <g>{rects(true)}</g>
    </svg>
  );
};
