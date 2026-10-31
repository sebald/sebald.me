'use client';

import { useEffect, useState } from 'react';

import { PALETTE } from './palette';
import { px } from './stage';
import { useClock } from './use-clock';

/**
 * The phases, as the share of the time left: gold while a counter still
 * counts as fast (the first half, the momentum's colour), then ember,
 * then red and blinking for the last quarter
 */
const FAST = 0.5;
const LATE = 0.25;

/** How long the line flashes when the fast half runs out */
const FLASH_MS = 300;

/** The late blink */
const BLINK_MS = 250;

/**
 * The row's height in stage pixels (the bubble's), the room under it to
 * the phrase, and the line's height inside it
 */
const ROW = { height: 6, gap: 4, line: 3 } as const;

/**
 * The "…" bubble at the row's left, the silence the line measures: paper
 * in ink with three dots, a tail at its bottom left. `p` paper, `#` ink,
 * `1` to `3` the dots, which go out one at a time in the last quarter.
 */
const BUBBLE = [
  '.#######.',
  '#ppppppp#',
  '#p1p2p3p#',
  '#ppppppp#',
  '.#p#####.',
  '.##......',
];

/**
 * The line's ends fade out in two dither steps, the way the windows'
 * light fades under the frame: for each of the three columns from the
 * end, the rows that are lit
 */
const FADE: [column: number, rows: number[]][] = [
  [0, [1]],
  [1, [0, 2]],
  [2, [0, 1]],
];

/** One pixel of dither in a colour, every other column */
const dots = (colour: string) =>
  `repeating-linear-gradient(90deg, ${colour} 0 var(--px), transparent var(--px) calc(var(--px) * 2))`;

interface Colours {
  /** The line's top row, its middle row, its dithered bottom row */
  rows: [string, string, string];
}

/** Gold, the flash, ember, red */
const colours = (share: number, flash: boolean): Colours => {
  if (flash)
    return { rows: [PALETTE.spark, PALETTE.spark, PALETTE.emberLight] };
  if (share > FAST)
    return { rows: [PALETTE.gold, PALETTE.gold, PALETTE.goldShade] };
  if (share > LATE)
    return { rows: [PALETTE.ember, PALETTE.ember, PALETTE.emberShade] };
  return { rows: [PALETTE.stamp, PALETTE.stamp, PALETTE.stamp] };
};

/** The bubble, its dots lit as far as `lit` (3 to 0) */
const Bubble = ({ lit }: { lit: number }) => (
  <svg
    viewBox={`0 0 ${BUBBLE[0]!.length} ${BUBBLE.length}`}
    shapeRendering="crispEdges"
    className="block shrink-0"
    style={{ width: px(BUBBLE[0]!.length), height: px(BUBBLE.length) }}
  >
    {BUBBLE.flatMap((row, y) =>
      row.split('').map((cell, x) => {
        if (cell === '.') return null;
        const dot = Number(cell);
        const fill =
          cell === '#'
            ? PALETTE.ink
            : dot > 0
              ? dot <= lit
                ? PALETTE.ink
                : PALETTE.paperShade
              : PALETTE.paper;
        return (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill={fill}
          />
        );
      }),
    )}
  </svg>
);

export interface SilenceTimerProps {
  elapsed: number;
  limit: number;
  /** No blink, no growing in */
  still?: boolean;
}

/**
 * The silence bar, a row at the top of the dialogue window while the
 * defender picks a counter: a "…" bubble and a line burning back from
 * both ends toward the middle, its ends fading out in two dither steps.
 * Gold while a counter still counts as fast, a flash when that half runs
 * out, ember after it, and the last quarter red and blinking while the
 * bubble's dots go out one at a time. It grows in when the menu opens;
 * the window stands on the stage's bottom, so its top edge rises and the
 * phrase and the options stay where they are. Under reduced motion it is
 * there at once and does not blink.
 */
export const SilenceTimer = ({
  elapsed,
  limit,
  still = false,
}: SilenceTimerProps) => {
  const share = Math.max(0, Math.min(1, 1 - elapsed / limit));
  const late = share <= LATE;
  // A moment you notice, not only a colour: the fast half running out
  const sinceFast = elapsed - limit * (1 - FAST);
  const flash = sinceFast >= 0 && sinceFast < FLASH_MS;
  const clock = useClock(late && !still);
  const off = late && !still && Math.floor(clock / BLINK_MS) % 2 === 1;
  const { rows } = colours(share, flash);
  const lit = share > LATE ? 3 : Math.ceil((share / LATE) * 3);

  // Grown in on the frame after it mounts, so the height transitions
  const [open, setOpen] = useState(still);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      aria-hidden
      className="shrink-0 overflow-hidden transition-[height,margin] duration-150 ease-out motion-reduce:transition-none"
      style={{
        height: open ? px(ROW.height) : 0,
        marginBottom: open ? px(ROW.gap) : 0,
      }}
    >
      <div className="flex items-center" style={{ gap: px(3) }}>
        <Bubble lit={lit} />
        <span
          className="relative block flex-1"
          style={{ height: px(ROW.line) }}
        >
          {/* The time left, centred, rounded to two pixels so both ends
              burn back together */}
          <span
            className="absolute inset-y-0 left-1/2 -translate-x-1/2"
            style={{
              width: `round(down, ${share * 100}%, calc(var(--px) * 2))`,
              opacity: off ? 0.35 : 1,
            }}
          >
            {rows.map((colour, row) => (
              <span
                key={row}
                className="absolute"
                style={{
                  left: px(3),
                  right: px(3),
                  top: px(row),
                  height: px(1),
                  background: row === 2 ? dots(colour) : colour,
                }}
              />
            ))}
            {(['left', 'right'] as const).flatMap(end =>
              FADE.flatMap(([column, lit]) =>
                lit.map(row => (
                  <span
                    key={`${end}-${column}-${row}`}
                    className="absolute"
                    style={{
                      [end]: px(column),
                      top: px(row),
                      width: px(1),
                      height: px(1),
                      background: rows[row],
                    }}
                  />
                )),
              ),
            )}
          </span>
        </span>
      </div>
    </div>
  );
};
