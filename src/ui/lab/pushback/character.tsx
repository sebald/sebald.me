'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { Side } from '@/lib/lab/pushback/duel';
import {
  type SheetId,
  cellFor,
  mouthOpen,
  tearDrop,
} from '@/lib/lab/pushback/sprites';
import {
  LAYOUT,
  type Pose,
  breathFrame,
  poseOffset,
} from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { drawCell, drawTear } from './draw';
import { useSprites } from './sheets';
import { useStage } from './stage';
import { useClock } from './use-clock';

/** Placeholder colours, until the sprite is built */
const PLACEHOLDER: Record<Side, { body: string; head: string; light: string }> =
  {
    player: { body: '#2f8f8a', head: '#d9b38c', light: '#7fd6d0' },
    opponent: { body: '#c0622f', head: '#e3c2a0', light: '#f0a36f' },
  };

export interface CharacterProps {
  /** The sheet: a look's, or a colleague's */
  sheet: SheetId;
  pose?: Pose;
  /** Faces left: the right-hand duellist */
  mirrored?: boolean;
  /** The line is still typing: the talk pose alternates its mouth */
  typing?: boolean;
  /** The taunt is a mic drop: a longer step */
  micDrop?: boolean;
  /**
   * Stage x of the cell's left edge. Given, the character is positioned
   * absolutely with its feet on the feet line; without it, it is a block
   * the size of its cell.
   */
  x?: number;
  /** The feet line, the stage's by default (a scene's own in the viewer) */
  feet?: number;
  /** No animation at all: the resting frame of the pose */
  still?: boolean;
  /** Which placeholder to draw until the sprite is built */
  side?: Side;
  className?: string;
}

/**
 * One duellist: a canvas the size of a sheet cell (72 by 112 stage
 * pixels), drawn at the stage's device pixels, animating its pose on its
 * own clock: breathing when idle, the mouth moving while a line types,
 * the step and chuckle of a taunt, the flash of a flinch, the slump and
 * tears of a loss. Everything it needs is the sheet and the pose; the
 * duel just tells it which.
 */
export const Character = ({
  sheet,
  pose = 'idle',
  mirrored = false,
  typing = false,
  micDrop = false,
  x,
  feet = LAYOUT.feet,
  still = false,
  side = 'player',
  className,
}: CharacterProps) => {
  const { backing } = useStage();
  const sprite = useSprites(useMemo(() => [sheet], [sheet]))[sheet];
  const clock = useClock(!still);
  // When the pose changed, so its animation starts from its first frame
  const [since, setSince] = useState({ pose, at: clock });
  if (since.pose !== pose) setSince({ pose, at: clock });
  const elapsed = since.pose === pose ? clock - since.at : 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { width, height } = LAYOUT.cell;
    ctx.setTransform(backing, 0, 0, backing, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    const offset = still
      ? { dx: 0, dy: 0, lighter: false }
      : poseOffset(pose, elapsed, mirrored ? -1 : 1, micDrop);
    const bottom = height + offset.dy;
    if (!sprite) {
      const colours = PLACEHOLDER[side];
      const cx = offset.dx + Math.floor(width / 2);
      const body = offset.lighter ? colours.light : colours.body;
      ctx.fillStyle = body;
      ctx.fillRect(cx - 12, bottom - 24, 10, 24);
      ctx.fillRect(cx + 2, bottom - 24, 10, 24);
      ctx.fillRect(cx - 15, bottom - 76, 30, 52);
      ctx.fillStyle = offset.lighter ? colours.light : colours.head;
      ctx.fillRect(cx - 11, bottom - 100, 22, 22);
      return;
    }
    const cell = cellFor(pose);
    const breath = still ? 0 : breathFrame(pose, clock);
    const place = { x: offset.dx, bottom, mirrored };
    const draw = () =>
      drawCell(ctx, sprite, cell, place, {
        breath,
        // The hand stays up, only the mouth moves; shut between words
        // and once the line is typed
        mouthShut: pose === 'talk' && (still || !mouthOpen(elapsed, typing)),
      });
    draw();
    const fallen = pose === 'lose' && !still ? tearDrop(elapsed) : null;
    if (fallen !== null) drawTear(ctx, sprite, place, fallen, breath);
    if (offset.lighter) {
      // The flinch flash: the cell again, added on top of itself
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.3;
      draw();
      ctx.restore();
    }
  }, [
    backing,
    sprite,
    pose,
    elapsed,
    clock,
    mirrored,
    typing,
    micDrop,
    still,
    side,
  ]);

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
              top: `calc(var(--px) * ${feet - LAYOUT.cell.height})`,
            }),
      }}
    />
  );
};
