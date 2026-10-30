import type { CSSProperties } from 'react';

import { cn } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { px } from './stage';

/** The letters, three by five pixels each, `#` inked */
const FONT: Record<string, string[]> = {
  S: ['###', '#..', '###', '..#', '###'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  E: ['###', '#..', '##.', '#..', '###'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
};

const WORD = 'SHIPPED';

/**
 * The stamp rises a pixel every so many letters, left to right: a tilt
 * in steps, each step in the air between two letters so none is broken
 */
const TILT = 3;

/**
 * Pixels the stamp missed, as a worn rubber stamp does: column and row
 * in the flat stamp, before the tilt (on the frame only, the word reads
 * whole)
 */
const WORN = new Set(['4,0', '17,8', '26,0', '0,6', '30,3']);

/** The flat stamp's size: the word, a pixel of air and the frame round it */
const WIDTH = WORD.length * 4 - 1 + 4;
const BODY = 5 + 4;

/** How far a column sits below the stamp's top: the step it is on */
const RISE = Math.floor((WORD.length - 1) / TILT);
const drop = (x: number) =>
  RISE - Math.min(RISE, Math.floor(Math.max(0, x - 2) / 4 / TILT));

type Pixel = { x: number; y: number; part: 'ink' | 'air' };

/** Each pixel of the stamp, the tilt applied */
const PIXELS: Pixel[] = Array.from({ length: BODY }, (_, y) =>
  Array.from({ length: WIDTH }, (_, x): Pixel | null => {
    const at = { x, y: y + drop(x) };
    if (y === 0 || y === BODY - 1 || x === 0 || x === WIDTH - 1)
      return WORN.has(`${x},${y}`) ? null : { ...at, part: 'ink' };
    const column = x - 2;
    const row = y - 2;
    const letter = FONT[WORD[Math.floor(column / 4)] ?? ''];
    const inked =
      row >= 0 &&
      row <= 4 &&
      column >= 0 &&
      column % 4 !== 3 &&
      letter?.[row]?.[column % 4] === '#';
    return { ...at, part: inked ? 'ink' : 'air' };
  }),
)
  .flat()
  .filter((pixel): pixel is Pixel => pixel !== null);

/** The stamp's size in stage pixels */
export const STAMP = { width: WIDTH, height: BODY + RISE } as const;

/**
 * SHIPPED, a rubber stamp in red, tilted in pixel steps and worn on its
 * frame, the inside darkened so the word reads over a face. All on the
 * stage's grid; position it from outside.
 */
export const Stamp = ({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) => (
  <svg
    aria-hidden
    viewBox={`0 0 ${STAMP.width} ${STAMP.height}`}
    shapeRendering="crispEdges"
    className={cn('block', className)}
    style={{ width: px(STAMP.width), height: px(STAMP.height), ...style }}
  >
    {PIXELS.map(({ x, y, part }) => (
      <rect
        key={`${x}-${y}`}
        x={x}
        y={y}
        width={1}
        height={1}
        fill={part === 'ink' ? PALETTE.stamp : PALETTE.ink}
        fillOpacity={part === 'ink' ? 1 : 0.7}
      />
    ))}
  </svg>
);
