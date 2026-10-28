import type { CSSProperties, PropsWithChildren } from 'react';

import { cn } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { px } from './stage';

/**
 * Corners knocked out in a staircase of `steps` stage pixels: the pixel
 * way to round a box
 */
const stairs = (steps: number): string => {
  const p = (n: number) => `calc(var(--px) * ${n})`;
  const right = (n: number) => `calc(100% - ${p(n)})`;
  const bottom = (n: number) => `calc(100% - ${p(n)})`;
  // The top-left corner from the left edge to the top edge, one pixel
  // across and one up at a time
  const corner: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    corner.push([i, steps - i], [i + 1, steps - i]);
  }
  corner.push([steps, 0]);
  const back = [...corner].reverse();
  return [
    ...corner.map(([x, y]) => `${p(x)} ${p(y)}`),
    ...back.map(([x, y]) => `${right(x)} ${p(y)}`),
    ...corner.map(([x, y]) => `${right(x)} ${bottom(y)}`),
    ...back.map(([x, y]) => `${p(x)} ${bottom(y)}`),
  ].join(', ');
};

/** The tail's rows from its tip down: ink outline, then the paper inside */
const TAIL = [0, 1, 2, 3, 4];

export interface BubbleProps extends PropsWithChildren {
  /** Where the tail sits, in stage pixels from the right edge */
  tail?: number;
  /** Which way the tail points: up to a speaker above, down to one below */
  point?: 'up' | 'down';
  className?: string;
  style?: CSSProperties;
}

/**
 * A comic speech bubble on the stage's pixel grid: white paper, ink
 * letters, an ink outline with the corners stepped, a row of dithered
 * shade along the bottom like the window's, and a stair-stepped tail
 * pointing to whoever is speaking (down to the ghost under it).
 */
export const Bubble = ({
  tail = 10,
  point = 'up',
  className,
  style,
  children,
}: BubbleProps) => {
  // The tail's rows count from its tip, at the top or the bottom edge
  const edge = point === 'up' ? 'top' : 'bottom';
  return (
    <p
      className={cn(
        'relative m-0 px-[1em] pt-[0.7em] pb-[0.9em] text-[0.85em] leading-snug text-(--pb-ink)',
        className,
      )}
      style={style}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: PALETTE.ink, clipPath: `polygon(${stairs(2)})` }}
      />
      <span
        aria-hidden
        className="absolute"
        style={{
          inset: 'var(--px)',
          clipPath: `polygon(${stairs(1)})`,
          background: `repeating-conic-gradient(${PALETTE.paperShade} 0 25%, ${PALETTE.paper} 0 50%) left bottom / ${px(2)} ${px(2)} repeat-x, ${PALETTE.paper}`,
          backgroundSize: `${px(2)} ${px(2)}, auto`,
        }}
      />
      {/* The tail: ink rows widening from the tip, paper rows inside them,
        the last paper row cutting the outline where they meet */}
      {TAIL.map(row => (
        <span
          key={`ink-${row}`}
          aria-hidden
          className="absolute"
          style={{
            right: px(tail - row),
            [edge]: px(row - 5),
            width: px(row * 2 + 1),
            height: 'var(--px)',
            background: PALETTE.ink,
          }}
        />
      ))}
      {TAIL.slice(0, 4).map(row => (
        <span
          key={`paper-${row}`}
          aria-hidden
          className="absolute"
          style={{
            right: px(tail - row),
            [edge]: px(row - 3),
            width: px(row * 2 + 1),
            height: px(row === 3 ? 2 : 1),
            background: PALETTE.paper,
          }}
        />
      ))}
      <span className="relative">{children}</span>
    </p>
  );
};
