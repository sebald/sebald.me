'use client';

import { useClock, usePixels } from '@sebald/blip-ui';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  type Facing,
  type Pose,
  type SheetId,
  cellFor,
  mouthOpen,
  cries,
  tearDrop,
} from '../lib/sprites';
import { type Ambient, LAYOUT, breathFrame, poseOffset } from '../lib/stage';
import { drawCell, drawTear, washCell } from './draw';
import { useSprites } from './sheets';
import { cn } from './styles.utils';

export interface CharacterProps {
  /** The sheet: a look's, or a colleague's */
  sheet: SheetId;
  pose?: Pose;
  /** Which way it looks: `left` for the right-hand duellist */
  facing?: Facing;
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
  /** The room's light it stands in (`AMBIENT`); without it, as drawn */
  light?: Ambient;
  className?: string;
}

/**
 * One duellist: a canvas the size of a sheet cell (72 by 112 stage
 * pixels), drawn at the stage's device pixels, animating its pose on its
 * own clock: breathing when idle, the mouth moving while a line types,
 * the step and chuckle of a taunt, the flash and flicker of a flinch, the slump and
 * tears of a loss (not the Stakeholder's). Everything it needs is the sheet and the pose; the
 * duel just tells it which.
 */
export const Character = ({
  sheet,
  pose = 'idle',
  facing = 'right',
  typing = false,
  micDrop = false,
  x,
  feet = LAYOUT.feet,
  still = false,
  light,
  className,
}: CharacterProps) => {
  const { backing } = usePixels();
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
      ? { dx: 0, dy: 0, lighter: false, hidden: false }
      : poseOffset(pose, elapsed, facing === 'left' ? -1 : 1, micDrop);
    // A flicker frame of a flinch, or the sheet not built yet: the cell
    // stays clear
    if (offset.hidden || !sprite) return;
    const bottom = height + offset.dy;
    const cell = cellFor(pose);
    const breath = still ? 0 : breathFrame(pose, clock);
    const place = { x: offset.dx, bottom, facing };
    const draw = () =>
      drawCell(ctx, sprite, cell, place, {
        breath,
        // The hand stays up, only the mouth moves; shut between words
        // and once the line is typed
        mouthShut: pose === 'talk' && (still || !mouthOpen(elapsed, typing)),
      });
    draw();
    const fallen =
      pose === 'lose' && !still && cries(sheet) ? tearDrop(elapsed) : null;
    if (fallen !== null) drawTear(ctx, sprite, place, fallen, breath);
    if (offset.lighter) {
      // The flinch flash: the cell again, added on top of itself
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.3;
      draw();
      ctx.restore();
    }
    // Last, so the tear and the flash are in the room's light too
    if (light) washCell(ctx, width, height, light);
  }, [
    backing,
    sheet,
    sprite,
    pose,
    elapsed,
    clock,
    facing,
    typing,
    micDrop,
    still,
    light,
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
