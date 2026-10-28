'use client';

import type { Side } from '@/lib/lab/pushback/duel';
import type { SheetId } from '@/lib/lab/pushback/sprites';
import { LAYOUT, STAGE, bob, scaleBeam } from '@/lib/lab/pushback/stage';
import { cn, cva } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { Portrait } from './portrait';
import { px } from './stage';
import { useClock } from './use-clock';

const styles = {
  name: cva({
    base: [
      'font-semibold tracking-wide uppercase',
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
 * slightly brighter rim a pixel wide inside the ink, so the slot shows,
 * and a checker of dots inside that. Placed on the stage
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
        boxShadow: colours
          ? `0 0 0 var(--px) ${PALETTE.ink}`
          : `0 0 0 var(--px) ${PALETTE.ink}, inset 0 0 0 var(--px) ${PALETTE.emptyRim}`,
        background: colours
          ? bright
            ? colours.top
            : `linear-gradient(to bottom, ${colours.top} 0 var(--px), ${colours.mid} var(--px) calc(100% - var(--px)), ${colours.shade} calc(100% - var(--px)) 100%)`
          : PALETTE.empty,
      }}
    >
      {!colours && (
        <span
          className="absolute"
          style={{
            inset: 'var(--px)',
            background: `repeating-conic-gradient(${PALETTE.emptyDots} 0 25%, transparent 0 50%)`,
            backgroundSize: `${px(2)} ${px(2)}`,
          }}
        />
      )}
    </span>
  );
};

/** A lit stretch of beam: a light top row, the colour, a shaded bottom row */
const lit = (side: Side) => {
  const c = SIDE[side];
  return `linear-gradient(to bottom, ${c.top} 0 var(--px), ${c.mid} var(--px) calc(100% - var(--px)), ${c.shade} calc(100% - var(--px)) 100%)`;
};

/** Slides with the scale; snaps under reduced motion */
const SLIDE =
  'transition-[left,width] duration-300 ease-out motion-reduce:transition-none';

/**
 * The shared scale as a beam clash: gold from the player's end, ember
 * from the opponent's, a notch every step, meeting at a white spark,
 * and each duellist's face in the corner at its own end, framed in its
 * colour, so the beam says whose is whose.
 */
const ScaleBeam = ({
  beam,
  heads,
}: {
  beam: ReturnType<typeof scaleBeam>;
  heads?: Record<Side, SheetId>;
}) => {
  const { x, y, width, height, step, spark } = beam;
  // A duellist's face in its corner, framed in its side's colour
  const head = (side: Side, sheet: SheetId) => {
    const { x: inset, y: top, size } = LAYOUT.heads;
    return (
      <span
        className="absolute bg-(--pb-frame-inner)"
        style={{
          left: px(side === 'player' ? inset : STAGE.width - inset - size),
          top: px(top),
          boxShadow: `0 0 0 var(--px) ${SIDE[side].mid}, 0 0 0 ${px(2)} ${PALETTE.ink}`,
        }}
      >
        <Portrait
          sheet={sheet}
          scale={LAYOUT.heads.scale}
          mirrored={side === 'opponent'}
        />
      </span>
    );
  };
  return (
    <>
      {/* The ink around the whole beam */}
      <span
        className="absolute"
        style={{
          left: px(x - 1),
          top: px(y - 1),
          width: px(width + 2),
          height: px(height + 2),
          background: PALETTE.ink,
        }}
      />
      <span
        className={cn('absolute', SLIDE)}
        style={{
          left: px(x),
          top: px(y),
          width: px(spark - x),
          height: px(height),
          background: lit('player'),
        }}
      />
      <span
        className={cn('absolute', SLIDE)}
        style={{
          left: px(spark),
          top: px(y),
          width: px(x + width - spark),
          height: px(height),
          background: lit('opponent'),
        }}
      />
      {/* A notch of ink at every step, so the steps can be counted */}
      <span
        className="absolute"
        style={{
          left: px(x),
          top: px(y + 1),
          width: px(width),
          height: px(height - 2),
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0 calc(var(--px) * ${step - 1}), color-mix(in srgb, ${PALETTE.ink} 45%, transparent) calc(var(--px) * ${step - 1}) calc(var(--px) * ${step}))`,
        }}
      />
      {heads && (
        <>
          {head('player', heads.player)}
          {head('opponent', heads.opponent)}
        </>
      )}
      {/* The spark: a white core taller than the beam */}
      <span
        className={cn('absolute', SLIDE)}
        style={{
          left: px(spark - 1),
          top: px(y - 2),
          width: px(2),
          height: px(height + 4),
          background: PALETTE.spark,
          boxShadow: `0 0 0 var(--px) ${PALETTE.ink}`,
        }}
      />
    </>
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
  /** The duellists' sheets, for their faces beside the scale */
  heads?: Record<Side, SheetId>;
  /** Rows cropped off the top in a short window: the HUD moves down by this */
  crop?: number;
  /** No blinking */
  still?: boolean;
  className?: string;
}

/**
 * The bars along the top of the band, on the stage's pixel grid like
 * the room, in the fighting-game arrangement: each duellist's face in
 * its corner, the shared scale as a beam clash from one face to the
 * other, and under each end of it the name with the momentum pips after
 * it. A full momentum bar blinks at the idle rhythm.
 */
export const Hud = ({
  scale,
  toWin,
  toLose,
  momentum,
  momentumTotal,
  names,
  heads,
  crop = 0,
  still = false,
  className,
}: HudProps) => {
  const clock = useClock(!still);
  const blinkOn = !still && bob(clock) === 0;
  const beam = scaleBeam({ scale, toWin, toLose });
  // A side's name and momentum, one row under its end of the beam
  const plate = (side: Side) => {
    const { width, height, gap } = LAYOUT.pips;
    const full = momentum[side] >= momentumTotal;
    const boxes = Array.from({ length: momentumTotal }, (_, i) => (
      <Box
        key={i}
        width={width}
        height={height}
        side={i < momentum[side] ? side : null}
        bright={full && blinkOn}
      />
    ));
    return (
      <span
        className={cn(
          'absolute flex items-start',
          side === 'opponent' && 'flex-row-reverse',
        )}
        style={{
          top: px(LAYOUT.names.y),
          gap: px(gap * 2),
          ...(side === 'player'
            ? { left: px(beam.x) }
            : { right: px(STAGE.width - beam.x - beam.width) }),
        }}
      >
        <span className={styles.name({ side })}>{names[side]}</span>
        {/* Filling from the name outward */}
        <span
          className={cn('flex', side === 'opponent' && 'flex-row-reverse')}
          style={{ gap: px(gap) }}
        >
          {boxes}
        </span>
      </span>
    );
  };

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-x-0', className)}
      style={{ top: px(crop), height: px(LAYOUT.hud) }}
    >
      {plate('player')}
      {plate('opponent')}

      <ScaleBeam beam={beam} heads={heads} />
    </div>
  );
};
