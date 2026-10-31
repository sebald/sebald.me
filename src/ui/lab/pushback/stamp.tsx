import type { CSSProperties } from 'react';

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
  P: ['##.', '#.#', '##.', '#..', '#..'],
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
const draw = (word: string, flat = false) => {
  const width = word.length * 4 - 1 + 4;
  const rise = flat ? 0 : Math.floor((word.length - 1) / TILT);
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

/** A run of pixels on a row, the same part: one rect instead of many */
type Run = { x: number; y: number; width: number; part: Pixel['part'] };

/**
 * The flat stamp, each of its pixels `size` stage pixels, turned by
 * `angle` degrees on the stage's own grid: every stage pixel takes the
 * stamp pixel under its centre once turned back, so the edges step
 * like drawn pixel art rather than blur. The stepped tilt of the small
 * stamp breaks into blocks this large.
 */
const turn = (word: StampWord, size: number, angle: number) => {
  const flat = draw(word, true);
  const w = flat.width * size;
  const h = flat.height * size;
  const parts = new Map(flat.pixels.map(p => [`${p.x},${p.y}`, p.part]));
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const width = Math.ceil(Math.abs(w * cos) + Math.abs(h * sin));
  const height = Math.ceil(Math.abs(w * sin) + Math.abs(h * cos));
  const runs: Run[] = [];
  for (let y = 0; y < height; y++) {
    let run: Run | null = null;
    for (let x = 0; x < width; x++) {
      const dx = x + 0.5 - width / 2;
      const dy = y + 0.5 - height / 2;
      const sx = Math.floor((dx * cos + dy * sin + w / 2) / size);
      const sy = Math.floor((-dx * sin + dy * cos + h / 2) / size);
      const part = parts.get(`${sx},${sy}`);
      if (run && run.part === part) {
        run.width++;
        continue;
      }
      if (run) runs.push(run);
      run = part ? { x, y, width: 1, part } : null;
    }
    if (run) runs.push(run);
  }
  return { runs, width, height };
};

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

/** Where a duel's stamp lands: how big its pixels are, and its turn */
export const SLAM = { size: 5, long: 4, angle: -8 } as const;

/**
 * The thump as the stamp lands: a few puffs pushed out from under it,
 * along its bottom and its two ends, not a burst. How many, how far past
 * its edge they go in stage pixels, how big each is.
 */
const PUFFS = { count: 6, reach: 6, size: 2 } as const;

export interface SlamStampProps extends StampProps {
  /** Stage pixels a stamp pixel; `SLAM.long` keeps a long word in the band */
  size?: number;
  /** Degrees, counter-clockwise negative */
  angle?: number;
  /** A ring of sparks flying off its edge as it lands */
  sparks?: boolean;
}

/**
 * The stamp large and turned on the stage's grid, flat rather than in
 * the small one's steps: what lands on the stage at the end of a duel,
 * the word then seen on the roster's face
 */
export const SlamStamp = ({
  word,
  tone = 'red',
  size = word.length > 4 ? SLAM.long : SLAM.size,
  angle = SLAM.angle,
  sparks = false,
  className,
  style,
}: SlamStampProps) => {
  const { runs, width, height } = turn(word, size, angle);
  const stamp = (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={cn('block', className)}
      style={{ width: px(width), height: px(height), ...style }}
    >
      {runs.map(({ x, y, width: w, part }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={1}
          fill={part === 'ink' ? INK[tone] : PALETTE.ink}
          fillOpacity={part === 'ink' ? 1 : 0.7}
        />
      ))}
    </svg>
  );
  if (!sparks) return stamp;
  return (
    <span className="relative block">
      {stamp}
      {/* On the lower half of an ellipse round the stamp, from one end
          under it to the other, each pushed out sideways more than down;
          gone under reduced motion */}
      {Array.from({ length: PUFFS.count }, (_, i) => {
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
