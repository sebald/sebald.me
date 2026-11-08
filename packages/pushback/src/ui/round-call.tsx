import { BitmapText } from '@sebald/blip-ui';
import type { CSSProperties } from 'react';

import { PALETTE } from './palette';
import { px } from './stage';
import { cn } from './styles.utils';

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

/** When the flawless line's letters come in, after the title has landed */
const LINE = { from: 380, each: 50 } as const;

/** When the lost title's letters sag, after it has landed, one by one */
const SAG = { from: 650, each: 90 } as const;

export interface RoundCallProps {
  won: boolean;
  /** A line of FLAWLESS under YOU WIN, and sparkles round it */
  flawless?: boolean;
  /**
   * Lost to the Stakeholder: OFFLINE in place of YOU LOSE, their
   * `Let's take this offline.` as the word the run ends on
   */
  offline?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The end of a duel called the way a fighting game calls the round, over
 * the room: YOU WIN in gold (BitmapText's `large`) slamming in from three times its size, the
 * stage jolting as it lands; YOU LOSE in grey dropping in from above,
 * landing with a thud, its letters then sagging one after the other;
 * OFFLINE the same way when the Stakeholder wins. A flawless win adds
 * FLAWLESS under it, a letter at a time, and sparkles.
 * Position it from outside by its centre; under reduced motion it is
 * there at once and stays still.
 */
export const RoundCall = ({
  won,
  flawless = false,
  offline = false,
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
        {/* Its letters sag one after the other once it has landed, every
            other one twice as far (in the SVG's own units, stage pixels) */}
        <BitmapText
          variant="neutral"
          size="large"
          className={cn(
            '[--sag:2px] [&>:nth-child(even)]:[--sag:4px]',
            '*:animate-call-sag *:motion-reduce:animate-none',
            '*:[animation-delay:calc(var(--sag-from)+var(--i)*var(--sag-each))]',
          )}
          style={
            {
              '--sag-from': `${SAG.from}ms`,
              '--sag-each': `${SAG.each}ms`,
            } as CSSProperties
          }
        >
          {offline ? 'OFFLINE' : 'YOU LOSE'}
        </BitmapText>
      </div>
    );
  }
  return (
    <div
      className={cn('relative grid justify-items-center', className)}
      style={style}
    >
      <BitmapText
        size="large"
        className="animate-call-slam motion-reduce:animate-none"
      >
        YOU WIN
      </BitmapText>
      {flawless && (
        <>
          {/* A letter at a time */}
          <BitmapText
            variant="spark"
            className={cn(
              'mt-[calc(var(--px)*4)]',
              '*:animate-appear *:motion-reduce:animate-none',
              '*:[animation-delay:calc(var(--line-from)+var(--i)*var(--line-each))]',
            )}
            style={
              {
                '--line-from': `${LINE.from}ms`,
                '--line-each': `${LINE.each}ms`,
              } as CSSProperties
            }
          >
            FLAWLESS
          </BitmapText>
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
