'use client';

import NextImage from 'next/image';
import type { PropsWithChildren } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { BACKING, FRAME_MS, STAGE } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { type FrameModel, drawFrame } from './draw';
import { SCENE_ASSETS, loopFor } from './scenes';
import { GHOST_KEY, type Sprites, useSprites } from './sheets';
import { Stage } from './stage';
import { useScale } from './use-scale';

/**
 * The duel's frame: the scene loop under a 480 by 270 canvas drawn at
 * native size and scaled by a whole number with hard edges, plus a DOM
 * overlay in the same frame for everything that is text. Sits in the
 * same `Stage` as the menu screens, so nothing changes size.
 */
interface FrameProps extends PropsWithChildren {
  model: FrameModel;
  /** Called every 125 ms step while mounted and not paused */
  onStep?: (elapsedMs: number) => void;
  paused?: boolean;
  label: string;
  /** Fix the scale (the workbench) instead of fitting the viewport */
  scale?: number;
  className?: string;
}

export const Frame = ({
  model,
  onStep,
  paused = false,
  label,
  scale: fixedScale,
  className,
  children,
}: FrameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef(model);
  const stepRef = useRef(onStep);
  // The scene loop under the canvas; until it has loaded the canvas paints
  // the flat placeholder scene itself
  const [loadedScene, setLoadedScene] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const { scale } = useScale(fixedScale);
  // The sprites this frame draws, built in the background; placeholders
  // until then
  const sprites = useSprites(
    useMemo(
      () => ({
        [model.sprites.player.key]: model.sprites.player.swap,
        [model.sprites.opponent.key]: model.sprites.opponent.swap,
        [GHOST_KEY]: GHOST_KEY,
      }),
      [
        model.sprites.player.key,
        model.sprites.player.swap,
        model.sprites.opponent.key,
        model.sprites.opponent.swap,
      ],
    ),
  );
  const spritesRef = useRef<Sprites>(sprites);
  const assets = SCENE_ASSETS[model.scene];
  const loop = loopFor(assets, scale);
  const sceneKey = `${model.scene}:${loop.src}`;
  const sceneLoaded = loadedScene === sceneKey;
  useLayoutEffect(() => {
    modelRef.current = model;
    stepRef.current = onStep;
    loadedRef.current = sceneLoaded;
    spritesRef.current = sprites;
  });

  // One loop at 8 fps steps: redraw, and tell the screen a step passed
  useEffect(() => {
    if (paused) return;
    let frame = 0;
    let last = performance.now();
    let acc = 0;
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawFrame(ctx, modelRef.current, {
          background: !loadedRef.current,
          sprites: spritesRef.current,
        });
      }
    };
    draw();
    const loop = (now: number) => {
      acc += now - last;
      last = now;
      if (acc >= FRAME_MS) {
        const steps = Math.floor(acc / FRAME_MS);
        acc -= steps * FRAME_MS;
        stepRef.current?.(steps * FRAME_MS);
        draw();
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  // Redraw on model changes between steps, so input feels immediate, and
  // when a sprite lands
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawFrame(ctx, model, { background: !sceneLoaded, sprites });
  }, [model, sceneLoaded, sprites]);

  return (
    <Stage label={label} scale={fixedScale} className={className}>
      {/*
        The scene loop. At 1x the unscaled frames with hard edges; above,
        the 8x export scaled down smoothly, so every art pixel keeps the
        same size (scaling up would blur, `pixelated` would round pixels to
        uneven widths). The poster replaces it under reduced motion.
      */}
      <picture
        key={sceneKey}
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          sceneLoaded ? 'opacity-100' : 'opacity-0',
        )}
      >
        <source
          media="(prefers-reduced-motion: reduce)"
          srcSet={assets.poster.src}
        />
        <NextImage
          src={loop}
          alt=""
          width={STAGE.width}
          height={STAGE.height}
          // Animated and pre-scaled with hard edges: never resized by the
          // optimizer
          unoptimized
          loading="eager"
          onLoad={() => setLoadedScene(sceneKey)}
          className={cn(
            'absolute inset-0 h-full w-full',
            scale === 1 && '[image-rendering:pixelated]',
          )}
        />
      </picture>
      {/*
        Drawn at 2x and scaled down by CSS: exact at 2x and 1x, and a
        fraction between stays sharp where `pixelated` would round the
        art's pixels to uneven widths
      */}
      <canvas
        ref={canvasRef}
        aria-hidden
        width={STAGE.width * BACKING}
        height={STAGE.height * BACKING}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0">{children}</div>
    </Stage>
  );
};
