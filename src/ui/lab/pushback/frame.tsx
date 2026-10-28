'use client';

import NextImage from 'next/image';
import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { SceneId } from '@/lib/lab/pushback/characters';
import { FRAME_MS, LAYOUT, SCENE, STAGE } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { type FrameModel, drawFrame } from './draw';
import { SCENE_ASSETS, loopFor } from './scenes';
import { Stage, useStage } from './stage';

/** The loop of a scene to show at this stage's pixels, and its key */
const sceneLoop = (scene: SceneId, crisp: boolean) => {
  const assets = SCENE_ASSETS[scene];
  const loop = loopFor(assets, crisp);
  return { assets, loop, key: `${scene}:${loop.src}` };
};

interface RoomProps {
  scene: SceneId;
  /** The window of the render the band shows (`viewFor`) */
  view: { x: number; y: number };
  /** The loop has loaded (per scene and scale) */
  onLoad?: (key: string) => void;
}

/**
 * The room: a window of the scene loop at the stage's pixels, fading in
 * once it has loaded. On whole device pixels the 1x frames are blown up
 * with hard edges, which lands exactly on the art's pixels; otherwise the
 * 8x export is scaled down smoothly, so every art pixel keeps the same
 * width (`pixelated` would round them to uneven widths). The poster
 * replaces it under reduced motion. Position it inside a band-sized box
 * with `overflow-hidden`.
 */
export const Room = ({ scene, view, onLoad }: RoomProps) => {
  const { crisp } = useStage();
  const { assets, loop, key } = sceneLoop(scene, crisp);
  const [loaded, setLoaded] = useState<string | null>(null);
  return (
    <picture
      key={key}
      className={cn(
        'absolute transition-opacity duration-300',
        loaded === key ? 'opacity-100' : 'opacity-0',
      )}
      style={{
        left: `calc(var(--px) * ${-view.x})`,
        top: `calc(var(--px) * ${-view.y})`,
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
        onLoad={() => {
          setLoaded(key);
          onLoad?.(key);
        }}
        className={cn(
          'absolute inset-0 h-full w-full',
          crisp && '[image-rendering:pixelated]',
        )}
      />
    </picture>
  );
};

/**
 * The duel's frame: the scene loop in the room band (a window of the
 * 480 by 270 render, at the stage's pixels) with the duellists and the
 * ghost standing in it (`band`), under a canvas the size of the stage
 * for the chrome, drawn at the screen's device pixels where a stage
 * pixel is a whole number of them (`backingFor`) and at 3x scaled down
 * smoothly otherwise, plus a DOM overlay in the same frame for
 * everything that is text. Sits in the same `Stage` as the menu screens,
 * so nothing changes size.
 */
interface FrameProps extends PropsWithChildren {
  model: FrameModel;
  /** What stands in the room: the characters and the ghost */
  band?: ReactNode;
  /** Called every 125 ms step while mounted and not paused */
  onStep?: (elapsedMs: number) => void;
  paused?: boolean;
  label: string;
  /** Fix the scale (the workbench) instead of fitting the viewport */
  scale?: number;
  className?: string;
}

export const Frame = ({ label, scale, className, ...body }: FrameProps) => (
  <Stage label={label} scale={scale} crop="fit" className={className}>
    <FrameBody {...body} />
  </Stage>
);

type FrameBodyProps = Omit<FrameProps, 'label' | 'scale' | 'className'>;

/** Inside the stage, where its scale is known */
const FrameBody = ({
  model,
  band,
  onStep,
  paused = false,
  children,
}: FrameBodyProps) => {
  const { crisp, backing } = useStage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef(model);
  const stepRef = useRef(onStep);
  const backingRef = useRef(backing);
  // The scene loop under the canvas; until it has loaded the canvas paints
  // the flat placeholder band itself
  const [loadedScene, setLoadedScene] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const sceneKey = sceneLoop(model.scene, crisp).key;
  const sceneLoaded = loadedScene === sceneKey;
  useLayoutEffect(() => {
    modelRef.current = model;
    stepRef.current = onStep;
    loadedRef.current = sceneLoaded;
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

  // Redraw on model changes between steps, so input feels immediate, and
  // when the canvas is resized
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawFrame(ctx, model, { background: !sceneLoaded, backing });
  }, [model, sceneLoaded, backing]);

  return (
    <>
      {/* The room band: a window of the scene loop, with the people in it */}
      <div
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: `calc(var(--px) * ${LAYOUT.band})` }}
      >
        <Room scene={model.scene} view={model.view} onLoad={setLoadedScene} />
        {band}
      </div>
      {/*
        The chrome, drawn at the device pixels per stage pixel when that is
        whole, so the canvas is shown at its own size; else at 3x and
        scaled down smoothly by CSS, which keeps the art's pixels even
        where `pixelated` would round them. Transparent, so the band and
        the people show through.
      */}
      <canvas
        ref={canvasRef}
        aria-hidden
        width={STAGE.width * backing}
        height={STAGE.height * backing}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0">{children}</div>
    </>
  );
};
