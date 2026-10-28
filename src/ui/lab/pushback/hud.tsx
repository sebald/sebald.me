'use client';

import type { Side } from '@/lib/lab/pushback/duel';
import {
  LAYOUT,
  STAGE,
  barRects,
  barWidth,
  bob,
  scaleTicks,
} from '@/lib/lab/pushback/stage';
import { cn, cva } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { px } from './stage';
import { useClock } from './use-clock';

const styles = {
  name: cva({
    base: [
      'absolute font-semibold tracking-wide uppercase',
      'bg-(--pb-ink)/85 px-[calc(var(--px)*2)] py-[calc(var(--px)*0.5)]',
      'shadow-[0_0_0_var(--px)_var(--pb-ink)]',
    ],
    variants: {
      side: {
        player: 'text-(--pb-gold)',
        opponent: 'text-right text-(--pb-ember)',
      },
    },
  }),
};

/** The side's colours for a lit box */
const SIDE = {
  player: {
    top: PALETTE.goldLight,
    mid: PALETTE.gold,
    shade: PALETTE.goldShade,
  },
  opponent: {
    top: PALETTE.emberLight,
    mid: PALETTE.ember,
    shade: PALETTE.emberShade,
  },
} as const;

export interface BoxProps {
  /** Where it sits on the stage; without them it sits in the flow */
  x?: number;
  y?: number;
  width: number;
  height: number;
  /** Lit in this side's colour; empty and dithered without one */
  side?: Side | null;
  /** Lit all over in the light colour (a full bar blinking) */
  bright?: boolean;
}

/**
 * One box of a bar on the stage's grid, a pixel of ink around it: lit,
 * a light top row, the colour, a shaded bottom row; empty, dark with a
 * checker of dots inside its top and bottom rows. Placed on the stage
 * with `x` and `y`, or in the flow without them (a meter's boxes).
 */
export const Box = ({ x, y, width, height, side, bright }: BoxProps) => {
  const colours = side ? SIDE[side] : null;
  const placed = x !== undefined && y !== undefined;
  return (
    <span
      aria-hidden
      className={placed ? 'absolute' : 'relative inline-block shrink-0'}
      style={{
        left: placed ? px(x) : undefined,
        top: placed ? px(y) : undefined,
        width: px(width),
        height: px(height),
        boxShadow: `0 0 0 var(--px) ${PALETTE.ink}`,
        background: colours
          ? bright
            ? colours.top
            : `linear-gradient(to bottom, ${colours.top} 0 var(--px), ${colours.mid} var(--px) calc(100% - var(--px)), ${colours.shade} calc(100% - var(--px)) 100%)`
          : PALETTE.empty,
      }}
    >
      {!colours && (
        <span
          className="absolute inset-x-0"
          style={{
            top: 'var(--px)',
            bottom: 'var(--px)',
            background: `repeating-conic-gradient(${PALETTE.emptyDots} 0 25%, transparent 0 50%)`,
            backgroundSize: `${px(2)} ${px(2)}`,
          }}
        />
      )}
    </span>
  );
};

export interface HudProps {
  /** The shared scale, positive toward the player */
  scale: number;
  toWin: number;
  toLose: number;
  momentum: Record<Side, number>;
  momentumTotal: number;
  names: Record<Side, string>;
  /** Rows cropped off the top in a short window: the HUD moves down by this */
  crop?: number;
  /** No blinking */
  still?: boolean;
  className?: string;
}

/**
 * The bars along the top of the band, on the stage's pixel grid like
 * the room: the names in the corners, the momentum pips under them
 * filling from the outside in, and the shared scale across the centre with its marker. A full momentum bar
 * blinks at the idle rhythm.
 */
export const Hud = ({
  scale,
  toWin,
  toLose,
  momentum,
  momentumTotal,
  names,
  crop = 0,
  still = false,
  className,
}: HudProps) => {
  const clock = useClock(!still);
  const blinkOn = !still && bob(clock) === 0;
  const ticks = scaleTicks({ scale, toWin, toLose });
  const marker = ticks.find(tick => tick.marker);
  const markerColour = marker?.side ? SIDE[marker.side].top : PALETTE.steel;
  const pips = (side: Side) => {
    const { x, y, width, height, gap } = LAYOUT.pips;
    const w = barWidth(momentumTotal, { width, gap });
    const left = side === 'player' ? x : STAGE.width - x - w;
    const rects = barRects({
      x: left,
      y,
      count: momentumTotal,
      filled: momentum[side],
      width,
      height,
      gap,
    });
    // The right corner fills from its outer end
    const ordered = side === 'player' ? rects : [...rects].reverse();
    const full = momentum[side] >= momentumTotal;
    return ordered.map((pip, i) => (
      <Box
        key={`${side}-${i}`}
        x={pip.x}
        y={pip.y}
        width={pip.width}
        height={pip.height}
        side={i < momentum[side] ? side : null}
        bright={full && blinkOn}
      />
    ));
  };

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-x-0', className)}
      style={{ top: px(crop), height: px(LAYOUT.hud) }}
    >
      <span
        className={styles.name({ side: 'player' })}
        style={{ left: px(LAYOUT.names.x), top: px(LAYOUT.names.y) }}
      >
        {names.player}
      </span>
      <span
        className={styles.name({ side: 'opponent' })}
        style={{ right: px(LAYOUT.names.x), top: px(LAYOUT.names.y) }}
      >
        {names.opponent}
      </span>

      {pips('player')}
      {pips('opponent')}

      {ticks.map(tick => (
        <Box
          key={`tick-${tick.x}`}
          x={tick.x}
          y={tick.y}
          width={tick.width}
          height={tick.height}
          side={tick.lit ? tick.side : null}
        />
      ))}
      {marker && (
        <>
          {/* A bright notch on the marker's tick, and a pointer under it */}
          <span
            className="absolute"
            style={{
              left: px(marker.x + 1),
              top: px(marker.y + 1),
              width: px(marker.width - 2),
              height: px(marker.height - 2),
              background: markerColour,
            }}
          />
          <span
            className="absolute [clip-path:polygon(0_0,100%_0,50%_100%)]"
            style={{
              left: px(marker.x + Math.floor(marker.width / 2) - 2),
              top: px(marker.y + marker.height + 1),
              width: px(5),
              height: px(3),
              background: PALETTE.ink,
            }}
          />
          <span
            className="absolute [clip-path:polygon(0_0,100%_0,50%_100%)]"
            style={{
              left: px(marker.x + Math.floor(marker.width / 2) - 1),
              top: px(marker.y + marker.height + 1),
              width: px(3),
              height: px(2),
              background: markerColour,
            }}
          />
        </>
      )}
    </div>
  );
};
