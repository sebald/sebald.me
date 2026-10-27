'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';

import { FRAME_MS } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { drawCell } from './draw';
import { BURST_KEY, SHEETS, useSprites } from './sheets';
import { useStage } from './stage';
import { useClock } from './use-clock';

/** The burst sheet's cells */
export const BURST_CELLS = { small: 0, big: 1, popped: 2 } as const;

export interface BurstProps {
  /** Stage x and y of the cell's top left; inline without them */
  x?: number;
  y?: number;
  /** The resting cell: the burst, or the popped one */
  cell?: number;
  /** Pulse between the burst and its big beat every frame */
  pulse?: boolean;
  className?: string;
}

/**
 * The mic-drop burst: a comic starburst with the words in it, from its
 * sheet, pulsing between its two beats while the phrase is thrown and
 * popped when it is countered.
 */
export const Burst = ({
  x,
  y,
  cell = BURST_CELLS.small,
  pulse = false,
  className,
}: BurstProps) => {
  const { backing } = useStage();
  const sprite = useSprites(useMemo(() => ({ [BURST_KEY]: BURST_KEY }), []))[
    BURST_KEY
  ];
  const clock = useClock(pulse);
  const shown = pulse
    ? Math.floor(clock / FRAME_MS) % 2 === 0
      ? BURST_CELLS.small
      : BURST_CELLS.big
    : cell;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = SHEETS.micdrop.meta.cell;

  useLayoutEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(backing, 0, 0, backing, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    if (sprite) drawCell(ctx, sprite, shown, 0, height);
  }, [backing, sprite, shown, width, height]);

  const placed = x !== undefined && y !== undefined;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      width={width * backing}
      height={height * backing}
      className={cn(placed ? 'absolute' : 'block', className)}
      style={{
        width: `calc(var(--px) * ${width})`,
        height: `calc(var(--px) * ${height})`,
        ...(placed
          ? { left: `calc(var(--px) * ${x})`, top: `calc(var(--px) * ${y})` }
          : {}),
      }}
    />
  );
};
