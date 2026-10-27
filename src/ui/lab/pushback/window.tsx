'use client';

import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/lib/styles.utils';

import { CHROME } from './draw';
import { useInputKind } from './use-input-kind';

/** The quiet window's layers, from the outside in, one stage pixel each */
const RINGS = `0 0 0 var(--px) ${CHROME.frameInner}, 0 0 0 calc(var(--px) * 2) ${CHROME.frame}, 0 0 0 calc(var(--px) * 3) ${CHROME.ink}`;

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

const DOT = 'absolute size-[var(--px)] bg-[#0b0d16]';

export interface WindowProps extends PropsWithChildren {
  /** The control hints along the bottom edge */
  legend?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * The quiet RPG window every text sits in: ink, a pale frame, a dark
 * fill with two dithered rows, the corners knocked out, all on the
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
      className="relative flex min-h-0 flex-1 flex-col bg-[#131829] p-[calc(var(--px)*3)] leading-[1.35] text-[#c9c4b4]"
      style={{
        margin: 'calc(var(--px) * 3)',
        boxShadow: RINGS,
        // The two dithered rows under the frame
        backgroundImage: `repeating-linear-gradient(90deg, ${CHROME.fillTop} 0 var(--px), transparent var(--px) calc(var(--px) * 2)), repeating-linear-gradient(90deg, transparent 0 var(--px), ${CHROME.fillTop} var(--px) calc(var(--px) * 2))`,
        backgroundSize: '100% var(--px), 100% var(--px)',
        backgroundPosition: '0 0, 0 var(--px)',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
      {legend && (
        <div className="mt-auto pt-[calc(var(--px)*2)] text-right text-[0.75em] text-[#5c6488]">
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
          <span className="text-[#8a92b8]">{key}</span> {does}
        </span>
      ))}
    </>
  );
};
