'use client';

import { useLayoutEffect, useRef } from 'react';

import { GHOST } from '@/lib/lab/pushback/buddy';
import { ghostCell } from '@/lib/lab/pushback/sprites';
import { LAYOUT, bob } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { GHOST_ALPHA, drawCell } from './draw';
import { PALETTE } from './palette';
import { GHOST_KEY, useSprites } from './sheets';

const GHOST_KEYS = [GHOST_KEY] as const;
import { useStage } from './stage';
import { useClock } from './use-clock';

export interface GhostProps {
  /** Stage x of its cell's left edge; it hovers at the player's shoulder */
  x?: number;
  /** The whisper step: it points from the second one on */
  step?: number;
  /** 0 to 1: how far out of the black hole it is (`ghostEnter`) */
  enter?: number;
  still?: boolean;
  className?: string;
}

/**
 * The ghost of the predecessor: a see-through figure that hovers, points
 * at the menu when it whispers, and comes out of (or goes back into) a
 * black hole at its middle, squeezed sideways as it does.
 */
export const Ghost = ({
  x,
  step = 0,
  enter = 1,
  still = false,
  className,
}: GhostProps) => {
  const { backing } = useStage();
  const sprite = useSprites(GHOST_KEYS)[GHOST_KEY];
  const clock = useClock(!still);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { width, height } = LAYOUT.cell;
    ctx.setTransform(backing, 0, 0, backing, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    const dy = GHOST.lift + (still ? 0 : bob(clock, 1200));
    const cell = ghostCell(step, still ? 0 : clock);
    const cx = width / 2;
    const bottom = height - dy;
    const box = sprite?.meta.cells[cell]?.box;
    // The middle of the figure: where the hole is
    const midY = box
      ? Math.round(bottom - (height - box.y - box.height / 2))
      : bottom - 28;
    ctx.save();
    if (enter < 1) {
      // The black hole: a dark disc with a pale rim that the ghost is
      // drawn out of, or into, squeezed sideways
      const r = Math.round(2 + 5 * (1 - enter));
      for (let yy = -r; yy <= r; yy++) {
        const w = Math.round(Math.sqrt(r * r - yy * yy));
        ctx.fillStyle = PALETTE.ghostHole;
        ctx.fillRect(cx - w, midY + yy, 2 * w, 1);
        if (Math.abs(yy) === r) continue;
        ctx.fillStyle = PALETTE.ghostRim;
        ctx.fillRect(cx - w, midY + yy, 1, 1);
        ctx.fillRect(cx + w - 1, midY + yy, 1, 1);
      }
      ctx.translate(cx, midY);
      ctx.scale(Math.max(0.05, enter), 0.25 + 0.75 * enter);
      ctx.translate(-cx, -midY);
    }
    ctx.globalAlpha = GHOST_ALPHA;
    if (sprite) {
      drawCell(ctx, sprite, cell, { x: 0, bottom });
    } else {
      ctx.fillStyle = PALETTE.ghost;
      ctx.fillRect(cx - 10, bottom - 40, 20, 34);
      ctx.fillStyle = PALETTE.ghostLight;
      ctx.fillRect(cx - 9, bottom - 58, 18, 18);
    }
    ctx.restore();
  }, [backing, sprite, clock, step, enter, still]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      width={LAYOUT.cell.width * backing}
      height={LAYOUT.cell.height * backing}
      className={cn(x === undefined ? 'block' : 'absolute', className)}
      style={{
        width: `calc(var(--px) * ${LAYOUT.cell.width})`,
        height: `calc(var(--px) * ${LAYOUT.cell.height})`,
        ...(x === undefined
          ? {}
          : {
              left: `calc(var(--px) * ${x})`,
              top: `calc(var(--px) * ${LAYOUT.feet - LAYOUT.cell.height})`,
            }),
      }}
    />
  );
};
