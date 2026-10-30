import type { CSSProperties } from 'react';

import { cn } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { px } from './stage';

/** The letters, three by five pixels each, `#` inked */
const FONT: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  L: ['#..', '#..', '#..', '#..', '###'],
  N: ['###', '#.#', '#.#', '#.#', '#.#'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  S: ['###', '#..', '###', '..#', '###'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
};

/** What a stamp can say: a role shipped, a colleague beaten, beaten flawless */
export type StampWord = 'SHIPPED' | 'DONE' | 'FLAWLESS';

/** The ink: red for a job done, gold for one done without a scratch */
export type StampTone = 'red' | 'gold';

const INK: Record<StampTone, string> = {
  red: PALETTE.stamp,
  gold: PALETTE.gold,
};

/**
 * The stamp rises a pixel every so many letters, left to right: a tilt
 * in steps, each step in the air between two letters so none is broken
 */
const TILT = 3;

/** The flat stamp's height: the letters, a pixel of air and the frame */
const BODY = 5 + 4;

type Pixel = { x: number; y: number; part: 'ink' | 'air' };

/**
 * A stamp's pixels, the tilt applied, and its size. Worn, as a rubber
 * stamp is, in a few pixels of the frame at the same places along any
 * word (never in the letters, so the word reads whole).
 */
const draw = (word: string) => {
  const width = word.length * 4 - 1 + 4;
  const rise = Math.floor((word.length - 1) / TILT);
  const drop = (x: number) =>
    rise - Math.min(rise, Math.floor(Math.max(0, x - 2) / 4 / TILT));
  const worn = new Set([
    `4,0`,
    `${width - 5},0`,
    `${Math.floor(width / 2) + 1},${BODY - 1}`,
    `0,6`,
    `${width - 1},3`,
  ]);
  const pixels: Pixel[] = [];
  for (let y = 0; y < BODY; y++)
    for (let x = 0; x < width; x++) {
      const at = { x, y: y + drop(x) };
      if (y === 0 || y === BODY - 1 || x === 0 || x === width - 1) {
        if (!worn.has(`${x},${y}`)) pixels.push({ ...at, part: 'ink' });
        continue;
      }
      const column = x - 2;
      const row = y - 2;
      const letter = FONT[word[Math.floor(column / 4)] ?? ''];
      const inked =
        row >= 0 &&
        row <= 4 &&
        column >= 0 &&
        column % 4 !== 3 &&
        letter?.[row]?.[column % 4] === '#';
      pixels.push({ ...at, part: inked ? 'ink' : 'air' });
    }
  return { pixels, width, height: BODY + rise };
};

const STAMPS = Object.fromEntries(
  (['SHIPPED', 'DONE', 'FLAWLESS'] as const).map(word => [word, draw(word)]),
) as Record<StampWord, ReturnType<typeof draw>>;

/** A stamp's size in stage pixels, to place it */
export const stampSize = (word: StampWord) => ({
  width: STAMPS[word].width,
  height: STAMPS[word].height,
});

export interface StampProps {
  word: StampWord;
  tone?: StampTone;
  className?: string;
  style?: CSSProperties;
}

/**
 * A rubber stamp: the word in a three by five pixel font in a frame,
 * tilted up in pixel steps and worn in a few pixels of the frame, the
 * inside darkened so it reads over a face. SHIPPED on a role the
 * Stakeholder signed off, DONE on a colleague beaten, FLAWLESS in gold
 * on one beaten without losing an exchange. All on the stage's grid;
 * position it from outside.
 */
export const Stamp = ({ word, tone = 'red', className, style }: StampProps) => {
  const { pixels, width, height } = STAMPS[word];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={cn('block', className)}
      style={{ width: px(width), height: px(height), ...style }}
    >
      {pixels.map(({ x, y, part }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={part === 'ink' ? INK[tone] : PALETTE.ink}
          fillOpacity={part === 'ink' ? 1 : 0.7}
        />
      ))}
    </svg>
  );
};
