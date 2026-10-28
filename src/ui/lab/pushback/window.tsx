'use client';

import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { useInputKind } from './use-input-kind';

/** The quiet window's layers, from the outside in, one stage pixel each */
const RINGS = `0 0 0 var(--px) ${PALETTE.frameInner}, 0 0 0 calc(var(--px) * 2) ${PALETTE.frame}, 0 0 0 calc(var(--px) * 3) ${PALETTE.ink}`;

/** The corners knocked out: a staircase notch of three pixels at each */
const NOTCHED = [
  'calc(var(--px) * 2) 0',
  'calc(100% - var(--px) * 2) 0',
  'calc(100% - var(--px) * 2) var(--px)',
  'calc(100% - var(--px)) var(--px)',
  'calc(100% - var(--px)) calc(var(--px) * 2)',
  '100% calc(var(--px) * 2)',
  '100% calc(100% - var(--px) * 2)',
  'calc(100% - var(--px)) calc(100% - var(--px) * 2)',
  'calc(100% - var(--px)) calc(100% - var(--px))',
  'calc(100% - var(--px) * 2) calc(100% - var(--px))',
  'calc(100% - var(--px) * 2) 100%',
  'calc(var(--px) * 2) 100%',
  'calc(var(--px) * 2) calc(100% - var(--px))',
  'var(--px) calc(100% - var(--px))',
  'var(--px) calc(100% - var(--px) * 2)',
  '0 calc(100% - var(--px) * 2)',
  '0 calc(var(--px) * 2)',
  'var(--px) calc(var(--px) * 2)',
  'var(--px) var(--px)',
  'calc(var(--px) * 2) var(--px)',
].join(', ');

const DOT = 'absolute size-[var(--px)] bg-(--pb-ink)';

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
  className?: string;
  style?: CSSProperties;
}

/**
 * The quiet RPG window every text sits in: ink, a pale frame, a dark
 * fill with a dithered gradient, lighter under the frame and darker at
 * the bottom edge, the corners knocked out, all on the
 * stage's pixel grid through `--px`. DOM, so it grows with what is in it
 * and the same window serves the duel, the menu screens and the
 * inventory. Position and size it from outside; `3 * --px` of that is
 * the frame.
 */
export const Window = ({ legend, className, style, children }: WindowProps) => (
  <div
    className={cn('relative flex flex-col', className)}
    style={{ clipPath: `polygon(${NOTCHED})`, ...style }}
  >
    {/* The diagonal pixel of each corner stays ink */}
    <span aria-hidden className={cn(DOT, 'top-[var(--px)] left-[var(--px)]')} />
    <span
      aria-hidden
      className={cn(DOT, 'top-[var(--px)] right-[var(--px)]')}
    />
    <span
      aria-hidden
      className={cn(DOT, 'bottom-[var(--px)] left-[var(--px)]')}
    />
    <span
      aria-hidden
      className={cn(DOT, 'right-[var(--px)] bottom-[var(--px)]')}
    />
    <div
      className="relative flex min-h-0 flex-1 flex-col bg-(--pb-fill) p-[calc(var(--px)*3+4px)] leading-[1.35] text-(--pb-text)"
      style={{
        margin: 'calc(var(--px) * 3)',
        boxShadow: RINGS,
        ...DITHER,
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
