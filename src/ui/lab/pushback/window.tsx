'use client';

import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { useInputKind } from './use-input-kind';

/**
 * The rounded corner as a pixel staircase: how far in each row from the
 * corner starts, top row first. The ink outline takes the outermost,
 * each ring inside one step smaller, so the corner curves the same way
 * through every layer and the fill's own corner is square.
 */
const CORNERS = [[3, 1, 1], [2, 1], [1]];

/** The window's rings, from the outside in, one stage pixel each */
const RINGS = [PALETTE.ink, PALETTE.frame, PALETTE.frameInner];

/**
 * A `clip-path` with the staircase at all four corners, walked
 * clockwise: each corner's steps as offsets from that corner, mirrored
 * onto it, in the order the outline passes them
 */
const rounded = (steps: number[]) => {
  // From the left edge up to the top edge, round the top left corner,
  // the bottom row's step first
  const topLeft = [
    [0, steps.length],
    ...steps
      .map((indent, row) => [
        [indent, row + 1],
        [indent, row],
      ])
      .reverse()
      .flat(),
  ];
  const at = (n: number, from: 'start' | 'end') =>
    from === 'start'
      ? `calc(var(--px) * ${n})`
      : `calc(100% - var(--px) * ${n})`;
  const place = (x: 'start' | 'end', y: 'start' | 'end', reverse: boolean) =>
    (reverse ? [...topLeft].reverse() : topLeft).map(
      ([dx, dy]) => `${at(dx!, x)} ${at(dy!, y)}`,
    );
  return `polygon(${[
    ...place('start', 'start', false),
    ...place('end', 'start', true),
    ...place('end', 'end', false),
    ...place('start', 'end', true),
  ].join(', ')})`;
};

/**
 * The dithered gradient of the fill, in stage pixels: a solid row of the
 * light shade under the frame, then rows at a half, a quarter and an
 * eighth of the dots, into the fill; the same steps in the dark shade up
 * from the bottom edge, without the solid row. One `repeating-linear-
 * gradient` per row, a dot every `period` pixels from `offset`, so it
 * stays on the grid at every scale. Low contrast on purpose: a texture
 * the eye reads as light falling on the window, not a pattern.
 */
interface Row {
  /** Rows from the edge, 0 the first */
  at: number;
  /** A dot every so many pixels; 1 is a solid row */
  period: number;
  /** The first dot's column */
  offset: number;
}

const FADE: Row[] = [
  { at: 1, period: 2, offset: 0 },
  { at: 2, period: 2, offset: 1 },
  { at: 3, period: 4, offset: 0 },
  { at: 4, period: 4, offset: 2 },
  { at: 5, period: 8, offset: 0 },
  { at: 6, period: 8, offset: 4 },
];

const TOP: Row[] = [{ at: 0, period: 1, offset: 0 }, ...FADE];
const BOTTOM: Row[] = FADE.map(row => ({ ...row, at: row.at - 1 }));

const px = (n: number) => (n === 0 ? '0px' : `calc(var(--px) * ${n})`);

const dither = (rows: Row[], colour: string, from: 'top' | 'bottom') =>
  rows.map(({ at, period, offset }) => ({
    image:
      period === 1
        ? `linear-gradient(${colour}, ${colour})`
        : `repeating-linear-gradient(90deg, ${colour} 0 var(--px), transparent var(--px) ${px(period)})`,
    position: `${px(offset)} ${from === 'top' ? px(at) : `calc(100% - ${px(at)})`}`,
  }));

const LAYERS = [
  ...dither(TOP, PALETTE.fillTop, 'top'),
  ...dither(BOTTOM, PALETTE.fillShade, 'bottom'),
];

const DITHER: CSSProperties = {
  backgroundImage: LAYERS.map(layer => layer.image).join(', '),
  backgroundPosition: LAYERS.map(layer => layer.position).join(', '),
  backgroundSize: '100% var(--px)',
  backgroundRepeat: 'no-repeat',
};

export interface WindowProps extends PropsWithChildren {
  /** The control hints along the bottom edge */
  legend?: ReactNode;
  /**
   * A small window holding one thing (the silence bar's tab): two pixels
   * of padding and a plain fill, no light falling on it
   */
  tight?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The quiet RPG window every text sits in: ink, a pale frame, a dark
 * fill with a dithered gradient, lighter under the frame and darker at
 * the bottom edge, the corners rounded in pixel steps, all on the
 * stage's pixel grid through `--px`. DOM, so it grows with what is in it
 * and the same window serves the duel, the menu screens and the
 * inventory. Position and size it from outside; `3 * --px` of that is
 * the frame.
 */
export const Window = ({
  legend,
  tight = false,
  className,
  style,
  children,
}: WindowProps) => (
  // `data-window`: what a picker's description box sits beside
  <div
    data-window
    className={cn('relative flex flex-col', className)}
    style={style}
  >
    {/* The ink and the frame's rings, each a pixel further in; the
        content is not clipped, so nothing in it is cut at a corner */}
    {RINGS.map((colour, i) => (
      <span
        key={colour}
        aria-hidden
        className="absolute"
        style={{
          inset: `calc(var(--px) * ${i})`,
          backgroundColor: colour,
          clipPath: rounded(CORNERS[i]!),
        }}
      />
    ))}
    <div
      className={cn(
        'relative flex min-h-0 flex-1 flex-col bg-(--pb-fill) leading-[1.35] text-(--pb-text)',
        tight ? 'p-[calc(var(--px)*2)]' : 'p-[calc(var(--px)*3+4px)]',
      )}
      style={{
        margin: `calc(var(--px) * ${RINGS.length})`,
        ...(tight ? {} : DITHER),
      }}
    >
      {children}
      {legend && (
        <div className="mt-auto pt-[calc(var(--px)*2)] text-right text-[0.75em] text-(--pb-dim)">
          {legend}
        </div>
      )}
    </div>
  </div>
);

export interface LegendProps {
  /** Key and what it does, for keyboards */
  keys: [key: string, does: string][];
  /** The one line for touch */
  touch: string;
}

/** The control hints: what works right now, keys or touch */
export const Legend = ({ keys, touch }: LegendProps) => {
  const kind = useInputKind();
  if (kind === 'touch') return <>{touch}</>;
  return (
    <>
      {keys.map(([key, does], i) => (
        <span key={key}>
          {i > 0 && ' · '}
          <span className="text-(--pb-muted)">{key}</span> {does}
        </span>
      ))}
    </>
  );
};

/** The legend on its own, in the stage's bottom right corner */
export const CornerLegend = (props: LegendProps) => (
  <div className="absolute right-3 bottom-2 text-right text-[0.75em] text-(--pb-dim)">
    <Legend {...props} />
  </div>
);
