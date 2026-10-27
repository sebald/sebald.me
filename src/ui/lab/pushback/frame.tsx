'use client';

import type { PropsWithChildren } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  FRAME_MS,
  STAGE,
  fontSizeFor,
  scaleFor,
} from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { type FrameModel, drawFrame } from './draw';

/**
 * The scaled frame: a 480 by 270 canvas drawn at native size and scaled
 * by a whole number with hard edges, plus a DOM overlay in the same
 * frame for everything that is text. Breaks out of the page column, as
 * wide as the viewport allows.
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

const useScale = (fixed?: number) => {
  const [scale, setScale] = useState(fixed ?? 1);
  const [portrait, setPortrait] = useState(false);
  useLayoutEffect(() => {
    if (fixed) return;
    const measure = () => {
      const width = window.innerWidth - 24;
      const height = window.innerHeight - 160;
      setScale(scaleFor(width, Math.max(height, STAGE.height)));
      setPortrait(window.innerWidth < STAGE.width + 24);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [fixed]);
  return { scale, portrait };
};

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
  useLayoutEffect(() => {
    modelRef.current = model;
    stepRef.current = onStep;
  });
  const { scale, portrait } = useScale(fixedScale);

  // One loop at 8 fps steps: redraw, and tell the screen a step passed
  useEffect(() => {
    if (paused) return;
    let frame = 0;
    let last = performance.now();
    let acc = 0;
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawFrame(ctx, modelRef.current);
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

  // Redraw on model changes between steps, so input feels immediate
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawFrame(ctx, model);
  }, [model]);

  const width = STAGE.width * scale;
  const height = STAGE.height * scale;

  if (portrait && !fixedScale) {
    return (
      <section
        data-stage
        aria-label={label}
        className="rounded-2xl bg-mist-950 p-6 text-center font-mono text-sm text-mist-200"
      >
        Turn your phone sideways: the stage is 480 pixels wide.
      </section>
    );
  }

  return (
    <section
      data-stage
      aria-label={label}
      className={cn('relative select-none overflow-hidden', className)}
      style={{
        width,
        height,
        marginInline: `calc(50% - ${width / 2}px)`,
        fontSize: fontSizeFor(scale),
        // The overlay positions things in native pixels through this
        ['--px' as string]: `${scale}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        width={STAGE.width}
        height={STAGE.height}
        className="absolute inset-0 [image-rendering:pixelated]"
        style={{ width, height }}
      />
      <div className="absolute inset-0 font-mono text-mist-100 [text-shadow:0_1px_0_var(--color-mist-950)]">
        {children}
      </div>
    </section>
  );
};
