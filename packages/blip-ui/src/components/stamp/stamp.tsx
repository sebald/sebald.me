import type { SVGAttributes } from 'react';

import { type Font, glyphOf, supported } from '../../foundations/bitmap';
import { px } from '../../foundations/pixel';
import type { VariantProps } from '../../utils/styles';
import { stamp } from './stamp.styles';

/** The letters, three by five pixels each, `#` inked */
const FONT: Font = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  L: ['#..', '#..', '#..', '#..', '###'],
  N: ['###', '#.#', '#.#', '#.#', '#.#'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  P: ['###', '#.#', '###', '#..', '#..'],
  S: ['###', '#..', '###', '..#', '###'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  ' ': ['...', '...', '...', '...', '...'],
};

/** The letters a stamp can say, for the docs */
export const STAMP_GLYPHS = supported(FONT);

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
  const chars = [...word];
  const width = chars.length * 4 - 1 + 4;
  const rise = Math.floor((chars.length - 1) / TILT);
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
      const letter = glyphOf(FONT, chars[Math.floor(column / 4)] ?? ' ');
      const inked =
        row >= 0 &&
        row <= 4 &&
        column >= 0 &&
        column % 4 !== 3 &&
        letter[row]?.[column % 4] === '#';
      pixels.push({ ...at, part: inked ? 'ink' : 'air' });
    }
  return { pixels, width, height: BODY + rise };
};

/** A stamp's size in stage pixels, to place it */
export const stampSize = (word: string) => {
  const { width, height } = draw(word.toUpperCase());
  return { width, height };
};

type Variants = VariantProps<typeof stamp.root>;

export interface StampProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  'children'
> {
  /** What it says: letters from `STAMP_GLYPHS` and spaces, upper-cased; any other character is left blank */
  word: string;
  /**
   * The ink: `danger` for a job done, `primary` for one done without a scratch
   * @default 'danger'
   */
  variant?: NonNullable<Variants['variant']>;
}

/**
 * A rubber stamp: the word in a three by five pixel font in a frame,
 * tilted up in pixel steps and worn in a few pixels of the frame, the
 * inside darkened so it reads over a face. All on the stage's grid;
 * position it from outside. Decorative: say what it means in text too.
 */
export const Stamp = ({
  word,
  variant,
  className,
  style,
  ...props
}: StampProps) => {
  const { pixels, width, height } = draw(word.toUpperCase());
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      data-slot="stamp"
      className={stamp.root({ variant, className })}
      style={{ width: px(width), height: px(height), ...style }}
      {...props}
    >
      {pixels.map(({ x, y, part }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          className={part === 'ink' ? stamp.ink() : stamp.air()}
        />
      ))}
    </svg>
  );
};
