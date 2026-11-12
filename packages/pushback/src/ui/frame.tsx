'use client';

import { usePixels } from '@sebald/blip-ui';
import NextImage from 'next/image';
import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { SceneId } from '../lib/characters';
import { FRAME_MS } from '../lib/sprites';
import { LAYOUT, SCENE, STAGE, roomBox } from '../lib/stage';
import { fadeMask } from './dither';
import { type FrameModel, drawFrame } from './draw';
import { SCENE_ASSETS, loopFor } from './scenes';
import { loadImage } from './sheets';
import { Stage } from './stage';
import { cn } from './styles.utils';

/** The loop of a scene to show at this stage's pixels, and its key */
const sceneLoop = (scene: SceneId, crisp: boolean) => {
  const assets = SCENE_ASSETS[scene];
  const loop = loopFor(assets, crisp);
  return { assets, loop, key: `${scene}:${loop.src}` };
};

/**
 * Start loading a scene's room for a screen still to come, the loop that
 * `Room` will show at these pixels, or its poster under reduced motion
 */
export const preloadRoom = (scene: SceneId, crisp: boolean) => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { assets, loop } = sceneLoop(scene, crisp);
  loadImage((still ? assets.poster : loop).src).catch(() => {});
};

interface RoomProps {
  scene: SceneId;
  /** The window of the render the band shows (`viewFor`), in render pixels */
  view: { x: number; y: number };
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
export const Room = ({ scene, view }: RoomProps) => {
  const { crisp } = usePixels();
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
        onLoad={() => setLoaded(key)}
        className={cn(
          'absolute inset-0 h-full w-full',
          crisp && '[image-rendering:pixelated]',
        )}
      />
    </picture>
  );
};

interface ReflectionProps {
  scene: SceneId;
  /** The band's window of the scene (`viewFor`) */
  view: { x: number; y: number };
  /** Stage columns left of where the reflection starts */
  x?: number;
  /** How far down it reaches, in stage pixels */
  rows?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * The room's bottom rows mirrored under its edge, the way a floor
 * catches what stands on it: the band's last `rows` rows flipped and
 * faded out downward in an ordered dither, so where the room meets
 * the window the colours carry on for a moment instead of stopping at
 * a line. Its colours are the scene's own. Place it at the top of
 * what it lies on, `x` columns in from the stage's left; the duel lays
 * it on the ground under the band, behind the window, so the dark round
 * the window has a trace of the room in it.
 */
export const Reflection = ({
  scene,
  view,
  x = 0,
  rows = 30,
  className,
  style,
}: ReflectionProps) => {
  const mask = fadeMask(rows);
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 overflow-hidden',
        className,
      )}
      style={{
        height: `calc(var(--px) * ${rows})`,
        maskImage: mask,
        maskSize: `calc(var(--px) * 4) calc(var(--px) * ${rows})`,
        maskRepeat: 'repeat-x',
        ...style,
      }}
    >
      <div className="absolute inset-0 -scale-y-100">
        <Room
          scene={scene}
          view={{ x: view.x + x, y: view.y + LAYOUT.band - rows }}
        />
      </div>
    </div>
  );
};

/**
 * The duel's frame: the scene loop in the room band (a window of the
 * 480 by 270 render, at the stage's pixels) with the duellists and the
 * ghost standing in it (`band`), under a canvas the size of the stage
 * for the chrome, drawn at the screen's device pixels where a stage
 * pixel is a whole number of them (`backingFor`) and a little larger,
 * scaled down smoothly, otherwise, plus a DOM overlay in the same frame for
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
  /** Held upright, rows to move the room and the window down by (`Stage`) */
  lift?: number;
  className?: string;
}

export const Frame = ({ label, lift, className, ...body }: FrameProps) => (
  <Stage label={label} crop="fit" lift={lift} className={className}>
    <FrameBody {...body} />
  </Stage>
);

type FrameBodyProps = Omit<FrameProps, 'label' | 'lift' | 'className'>;

/** Inside the stage, where its scale is known */
const FrameBody = ({
  model,
  band,
  onStep,
  paused = false,
  children,
}: FrameBodyProps) => {
  const { backing } = usePixels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepRef = useRef(onStep);
  const backingRef = useRef(backing);
  useLayoutEffect(() => {
    stepRef.current = onStep;
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
        drawFrame(ctx, { backing: backingRef.current });
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

  // Redraw when the canvas is resized
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawFrame(ctx, { backing });
  }, [backing]);

  return (
    <>
      {/* The room band: a window of the scene loop, with the people in it */}
      <div
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: `calc(var(--px) * ${LAYOUT.band})` }}
      >
        <Room scene={model.scene} view={model.view} />
        {band}
      </div>
      {/*
        The chrome, drawn at the device pixels per stage pixel when that is
        whole, so the canvas is shown at its own size; else at the next
        whole number up and scaled down smoothly by CSS, which keeps the art's pixels even
        where `pixelated` would round them. Transparent, so the band and
        the people show through.
      */}
      <canvas
        ref={canvasRef}
        aria-hidden
        width={STAGE.width * backing}
        height={STAGE.height * backing}
        // The stage's own 214 rows: a tall stage's extra rows are its ground
        className="pointer-events-none absolute inset-x-0 top-0 w-full"
        style={{ height: `calc(var(--px) * ${STAGE.height})` }}
      />
      {/* The room mirrored onto the ground, behind the window */}
      <Reflection
        scene={model.scene}
        view={model.view}
        style={{ top: `calc(var(--px) * ${LAYOUT.band})` }}
      />
      <div className="absolute inset-0">{children}</div>
    </>
  );
};

/** The corner office's room inside its padded render */
const OFFICE = roomBox('office');

/**
 * The corner office, dimmed, behind a menu screen's window: its room
 * (not the padding round it) scaled to cover the screen, a hair more so
 * no padding shows at an edge, and centred. The room's box is a child
 * of the screen's size (`cqw`/`cqh`), the picture placed in it by
 * percentages: offset = (box − picture) × position
 */
export const Backdrop = () => (
  <div
    aria-hidden
    className="[container-type:size] absolute inset-0 overflow-hidden brightness-[0.22]"
  >
    <div
      className="absolute top-1/2 left-1/2 -translate-1/2 bg-no-repeat [image-rendering:pixelated]"
      style={{
        width: `calc(max(100cqw, 100cqh * ${OFFICE.width / OFFICE.height}) * 1.02)`,
        aspectRatio: `${OFFICE.width} / ${OFFICE.height}`,
        backgroundImage: `url(${SCENE_ASSETS.office.poster.src})`,
        backgroundSize: `${(SCENE.width / OFFICE.width) * 100}% auto`,
        backgroundPosition: `${(OFFICE.x / (SCENE.width - OFFICE.width)) * 100}% ${(OFFICE.y / (SCENE.height - OFFICE.height)) * 100}%`,
      }}
    />
  </div>
);
