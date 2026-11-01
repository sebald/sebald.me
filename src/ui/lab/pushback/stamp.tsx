import type { CSSProperties } from 'react';

import stamps from '@/assets/lab/pushback/sheets/stamps.png';
import { cn } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { px } from './stage';

/** The letters, three by five pixels each, `#` inked */
const FONT: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  C: ['###', '#..', '#..', '#..', '###'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '###'],
  L: ['#..', '#..', '#..', '#..', '###'],
  N: ['###', '#.#', '#.#', '#.#', '#.#'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  P: ['###', '#.#', '###', '#..', '#..'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['###', '#..', '###', '..#', '###'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
};

/**
 * What a stamp can say: a role shipped, a colleague beaten, beaten
 * flawless, a duel lost
 */
export type StampWord = 'SHIPPED' | 'DONE' | 'FLAWLESS' | 'REJECTED';

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

const WORDS = ['SHIPPED', 'DONE', 'FLAWLESS', 'REJECTED'] as const;

const STAMPS = Object.fromEntries(
  WORDS.map(word => [word, draw(word)]),
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
 * The drawn stamps, one cell each in the order of `DRAWN`, cut from two
 * Gemini renders (`sources/stamps-1.jpg` and `stamps-2.jpg`) at the
 * cast's own pixel size and already turned
 */
const DRAWN: StampWord[] = ['DONE', 'FLAWLESS', 'REJECTED', 'SHIPPED'];
const CELL = { width: 80, height: 52 } as const;

/**
 * The thump as the stamp lands: a few puffs pushed out from under it,
 * along its bottom and its two ends, not a burst. How many, how far past
 * its edge they go in stage pixels, how big each is.
 */
const PUFFS = { count: 6, reach: 6, size: 2 } as const;

/** The glint's band: the spark's white, not quite opaque */
const GLINT = 'rgb(255 253 242 / 0.85)';

/**
 * Where the sparkles go off on a flawless stamp's edge, as shares of
 * its cell, and when, after the glint has started
 */
const SPARKLES = [
  { x: 0.12, y: 0.42, delay: 420 },
  { x: 0.86, y: 0.14, delay: 560 },
  { x: 0.9, y: 0.6, delay: 700 },
  { x: 0.24, y: 0.84, delay: 820 },
] as const;

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

const Sparkle = ({ style }: { style: CSSProperties }) => (
  <svg
    aria-hidden
    viewBox="0 0 9 9"
    shapeRendering="crispEdges"
    className="absolute -translate-1/2 animate-stamp-sparkle motion-reduce:hidden"
    style={{ width: px(9), height: px(9), ...style }}
  >
    {SPARKLE.flatMap((row, y) =>
      row
        .split('')
        .map((cell, x) =>
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

export interface SlamStampProps extends StampProps {
  /** A few puffs pushed out from under it as it lands */
  sparks?: boolean;
  /** Stage pixels a drawn pixel */
  scale?: number;
  /** A glint across it and a few sparkles beside it once it has landed */
  shine?: boolean;
}

/**
 * The stamp large and drawn, turned the way it hits: what lands on the
 * stage at the end of a duel, the word then seen on the roster's face,
 * and the Stakeholder's call across the face on the result screen.
 * `tone` is the puffs' ink; the stamp has its own.
 */
export const SlamStamp = ({
  word,
  tone = 'red',
  sparks = false,
  scale = 1,
  shine = false,
  className,
  style,
}: SlamStampProps) => {
  const width = CELL.width * scale;
  const height = CELL.height * scale;
  const cell = {
    size: `${px(width * DRAWN.length)} ${px(height)}`,
    position: `${px(-width * DRAWN.indexOf(word))} 0`,
  };
  const stamp = (
    <span
      aria-hidden
      className={cn('relative block [image-rendering:pixelated]', className)}
      style={{
        width: px(width),
        height: px(height),
        backgroundImage: `url(${stamps.src})`,
        backgroundSize: cell.size,
        backgroundPosition: cell.position,
        backgroundRepeat: 'no-repeat',
        ...style,
      }}
    >
      {/* The glint: a pale band swept across, masked by the stamp itself
          so it shows only where the stamp is */}
      {shine && (
        <span
          className="absolute inset-0 animate-stamp-glint motion-reduce:hidden"
          style={{
            backgroundImage: `linear-gradient(110deg, transparent 42%, ${GLINT} 42% 47%, transparent 47% 51%, ${GLINT} 51% 53%, transparent 53%)`,
            backgroundSize: '300% 100%',
            maskImage: `url(${stamps.src})`,
            maskSize: cell.size,
            maskPosition: cell.position,
            maskRepeat: 'no-repeat',
          }}
        />
      )}
    </span>
  );
  if (!sparks && !shine) return stamp;
  return (
    <span className="relative block">
      {stamp}
      {shine &&
        SPARKLES.map(({ x, y, delay }, i) => (
          <Sparkle
            key={i}
            style={{
              left: px(Math.round(x * width)),
              top: px(Math.round(y * height)),
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      {/* On the lower half of an ellipse round the stamp, from one end
          under it to the other, each pushed out sideways more than down;
          gone under reduced motion */}
      {sparks &&
        Array.from({ length: PUFFS.count }, (_, i) => {
          const around = (i / (PUFFS.count - 1)) * Math.PI;
          const x = Math.cos(around);
          const y = Math.sin(around);
          return (
            <span
              key={i}
              aria-hidden
              className="absolute animate-stamp-spark motion-reduce:hidden"
              style={
                {
                  left: px(Math.round(width / 2 + (x * width) / 2)),
                  top: px(Math.round(height / 2 + (y * height) / 2)),
                  width: px(PUFFS.size),
                  height: px(PUFFS.size),
                  // The stamp's ink with an ink edge, to read over a light wall
                  background: INK[tone],
                  boxShadow: `0 0 0 var(--px) ${PALETTE.ink}`,
                  '--spark-x': px(Math.round(x * PUFFS.reach)),
                  '--spark-y': px(Math.round(y * PUFFS.reach * 0.4)),
                } as CSSProperties
              }
            />
          );
        })}
    </span>
  );
};

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
