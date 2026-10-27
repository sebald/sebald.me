'use client';

import NextImage from 'next/image';
import type { PropsWithChildren } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { FRAME_MS, LAYOUT, SCENE, STAGE } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { type FrameModel, drawFrame } from './draw';
import { SCENE_ASSETS, loopFor } from './scenes';
import { GHOST_KEY, type Sprites, useSprites } from './sheets';
import { Stage } from './stage';
import { useScale } from './use-scale';

/**
 * The duel's frame: the scene loop in the room band (a window of the
 * 480 by 270 render, at the stage's pixels) under a canvas the size of
 * the stage, drawn at the screen's device pixels where a stage pixel is a
 * whole number of them (`backingFor`) and at 3x scaled down smoothly
 * otherwise, plus a DOM
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
  // the flat placeholder band itself
  const [loadedScene, setLoadedScene] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const { crop, crisp, backing } = useScale(fixedScale);
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
  const backingRef = useRef(backing);
  const assets = SCENE_ASSETS[model.scene];
  const loop = loopFor(assets, crisp);
  const sceneKey = `${model.scene}:${loop.src}`;
  const sceneLoaded = loadedScene === sceneKey;
  useLayoutEffect(() => {
    modelRef.current = model;
    stepRef.current = onStep;
    loadedRef.current = sceneLoaded;
    spritesRef.current = sprites;
    backingRef.current = backing;
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
          backing: backingRef.current,
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

  // Redraw on model changes between steps, so input feels immediate, when
  // a sprite lands and when the canvas is resized
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx)
      drawFrame(ctx, model, { background: !sceneLoaded, sprites, backing });
  }, [model, sceneLoaded, sprites, backing]);

  return (
    <Stage label={label} scale={fixedScale} crop={crop} className={className}>
      {/*
        The room band: a window of the scene loop. On whole device pixels
        the 1x frames are blown up with hard edges, which lands exactly on
        the art's pixels; otherwise the 8x export is scaled down smoothly,
        so every art pixel keeps the same width (`pixelated` would round
        them to uneven widths). The poster replaces it under reduced motion.
      */}
      <div
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: `calc(var(--px) * ${LAYOUT.band})` }}
      >
        <picture
          key={sceneKey}
          className={cn(
            'absolute transition-opacity duration-300',
            sceneLoaded ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            left: `calc(var(--px) * ${-model.view.x})`,
            top: `calc(var(--px) * ${-model.view.y})`,
            width: `calc(var(--px) * ${SCENE.width})`,
            height: `calc(var(--px) * ${SCENE.height})`,
          }}
        >
          <source
            media="(prefers-reduced-motion: reduce)"
            srcSet={assets.poster.src}
          />
          <NextImage
            src={loop}
            alt=""
            width={SCENE.width}
            height={SCENE.height}
            // Animated and pre-scaled with hard edges: never resized by the
            // optimizer
            unoptimized
            loading="eager"
            onLoad={() => setLoadedScene(sceneKey)}
            className={cn(
              'absolute inset-0 h-full w-full',
              crisp && '[image-rendering:pixelated]',
            )}
          />
        </picture>
      </div>
      {/*
        Drawn at the device pixels per stage pixel when that is whole, so
        the canvas is shown at its own size; else at 3x and scaled down
        smoothly by CSS, which keeps the art's pixels even where
        `pixelated` would round them
      */}
      <canvas
        ref={canvasRef}
        aria-hidden
        width={STAGE.width * backing}
        height={STAGE.height * backing}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0">{children}</div>
    </Stage>
  );
};
