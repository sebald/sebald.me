import type { CSSProperties } from 'react';

import { PALETTE } from './palette';
import { px } from './stage';
import { cn } from './styles.utils';

/** The letters of the call and the demo label, five by seven pixels each, `#` inked */
const FONT: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

const GLYPH = { width: 5, height: 7, gap: 1 } as const;

/** Its ramp: the top row lit, the bottom two shaded */
export interface Ramp {
  main: string;
  light: string;
  shade: string;
}

export const GOLD: Ramp = {
  main: PALETTE.gold,
  light: PALETTE.goldLight,
  shade: PALETTE.goldShade,
};
const GREY: Ramp = {
  main: PALETTE.steel,
  light: PALETTE.steelLight,
  shade: PALETTE.frameDim,
};
export const SPARK: Ramp = {
  main: PALETTE.spark,
  light: PALETTE.spark,
  shade: PALETTE.gold,
};

/** Room round a word for its ink line (one pixel) and its drop (two) */
const EDGE = { before: 1, after: 3 } as const;

interface WordProps {
  word: string;
  /** Stage pixels a letter pixel */
  size: number;
  ramp: Ramp;
  /** A class for each letter, by its place in the word */
  letter?: (index: number) => { className?: string; style?: CSSProperties };
  className?: string;
  style?: CSSProperties;
}

/**
 * A word in the call's letters, the way the logo's are drawn: each
 * letter pixel `size` stage pixels, an ink line round it, a hard drop
 * down and to the right, the top row lit and the bottom two shaded. Each
 * letter is its own group, so it can move on its own.
 */
export const Word = ({
  word,
  size,
  ramp,
  letter,
  className,
  style,
}: WordProps) => {
  const letters = [...word];
  const columns = letters.length * (GLYPH.width + GLYPH.gap) - GLYPH.gap;
  const width = columns * size + EDGE.before + EDGE.after;
  const height = GLYPH.height * size + EDGE.before + EDGE.after;
  const dots = (char: string) =>
    (FONT[char] ?? FONT[' ']!).flatMap((row, y) =>
      [...row].flatMap((cell, x) => (cell === '#' ? [{ x, y }] : [])),
    );
  const fill = (y: number) =>
    y === 0 ? ramp.light : y >= GLYPH.height - 2 ? ramp.shade : ramp.main;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={cn('block overflow-visible', className)}
      style={{ width: px(width), height: px(height), ...style }}
    >
      {letters.map((char, i) => {
        const left = EDGE.before + i * (GLYPH.width + GLYPH.gap) * size;
        const at = dots(char).map(({ x, y }) => ({
          x: left + x * size,
          y: EDGE.before + y * size,
          row: y,
        }));
        const { className: letterClass, style: letterStyle } =
          letter?.(i) ?? {};
        return (
          <g key={i} className={letterClass} style={letterStyle}>
            {/* The drop, then the ink line, then the letter */}
            {at.map(({ x, y }) => (
              <rect
                key={`d${x}-${y}`}
                x={x + 2}
                y={y + 2}
                width={size + 1}
                height={size + 1}
                fill={PALETTE.ink}
              />
            ))}
            {at.map(({ x, y }) => (
              <rect
                key={`o${x}-${y}`}
                x={x - 1}
                y={y - 1}
                width={size + 2}
                height={size + 2}
                fill={PALETTE.ink}
              />
            ))}
            {at.map(({ x, y, row }) => (
              <rect
                key={`l${x}-${y}`}
                x={x}
                y={y}
                width={size}
                height={size}
                fill={fill(row)}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

/**
 * A four-point sparkle, nine pixels across with its ink line: `*` the
 * spark's white, `+` light gold, `#` ink, so it reads over a light wall
 */
const SPARKLE = [
  '....#....',
  '...#*#...',
  '...#+#...',
  '.###+###.',
  '#*++*++*#',
  '.###+###.',
  '...#+#...',
  '...#*#...',
  '....#....',
];

const SPARKLE_FILL: Record<string, string> = {
  '*': PALETTE.spark,
  '+': PALETTE.goldLight,
  '#': PALETTE.ink,
};

/**
 * Where the sparkles go off round a flawless call, as shares of the
 * title's box, and when after it has landed
 */
const SPARKLES = [
  { x: -0.04, y: 0.1, delay: 520 },
  { x: 1.02, y: 0.05, delay: 640 },
  { x: 0.98, y: 0.95, delay: 760 },
  { x: 0.03, y: 0.9, delay: 880 },
] as const;

const Sparkle = ({ style }: { style: CSSProperties }) => (
  <svg
    aria-hidden
    viewBox="0 0 9 9"
    shapeRendering="crispEdges"
    className="absolute -translate-1/2 animate-call-sparkle motion-reduce:hidden"
    style={{ width: px(9), height: px(9), ...style }}
  >
    {SPARKLE.flatMap((row, y) =>
      [...row].map((cell, x) =>
        cell === '.' ? null : (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill={SPARKLE_FILL[cell]}
          />
        ),
      ),
    )}
  </svg>
);

/**
 * The call's sizes: stage pixels a letter pixel for the title (one less
 * for YOU LOSE, a letter longer) and for the flawless line under it
 */
export const SIZE = { win: 5, lose: 4, line: 2 } as const;

/** When the flawless line's letters come in, after the title has landed */
const LINE = { from: 380, each: 50 } as const;

/** When the lost title's letters sag, after it has landed, one by one */
const SAG = { from: 650, each: 90 } as const;

export interface RoundCallProps {
  won: boolean;
  /** A line of FLAWLESS under YOU WIN, and sparkles round it */
  flawless?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The end of a duel called the way a fighting game calls the round, over
 * the room: YOU WIN in gold slamming in from three times its size, the
 * stage jolting as it lands; YOU LOSE in grey dropping in from above,
 * landing with a thud, its letters then sagging one after the other. A
 * flawless win adds FLAWLESS under it, a letter at a time, and sparkles.
 * Position it from outside by its centre; under reduced motion it is
 * there at once and stays still.
 */
export const RoundCall = ({
  won,
  flawless = false,
  className,
  style,
}: RoundCallProps) => {
  if (!won) {
    return (
      <div
        className={cn(
          'animate-call-drop motion-reduce:animate-none',
          className,
        )}
        style={style}
      >
        <Word
          word="YOU LOSE"
          size={SIZE.lose}
          ramp={GREY}
          letter={i => ({
            className: 'animate-call-sag motion-reduce:animate-none',
            style: {
              animationDelay: `${SAG.from + i * SAG.each}ms`,
              // Every other letter sags twice as far; in the SVG's own
              // units, which are stage pixels already
              '--sag': `${i % 2 ? 4 : 2}px`,
            } as CSSProperties,
          })}
        />
      </div>
    );
  }
  return (
    <div
      className={cn('relative grid justify-items-center', className)}
      style={style}
    >
      <Word
        word="YOU WIN"
        size={SIZE.win}
        ramp={GOLD}
        className="animate-call-slam motion-reduce:animate-none"
      />
      {flawless && (
        <>
          <Word
            word="FLAWLESS"
            size={SIZE.line}
            ramp={SPARK}
            className="mt-[calc(var(--px)*4)]"
            letter={i => ({
              className: 'animate-appear motion-reduce:animate-none',
              style: { animationDelay: `${LINE.from + i * LINE.each}ms` },
            })}
          />
          {SPARKLES.map(({ x, y, delay }, i) => (
            <Sparkle
              key={i}
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                animationDelay: `${delay}ms`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
