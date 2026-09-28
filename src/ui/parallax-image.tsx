'use client';

import Image from 'next/image';
import type { PointerEvent } from 'react';
import { useEffect, useState } from 'react';

import { cn, toCSSVars } from '@/lib/styles.utils';

// Types
// ---------------
export interface ParallaxLayer {
  src: string;
  /**
   * Distance the layer travels when the pointer reaches the edge (e.g.
   * `4cqi`). Layers are oversized by 7.5% of the container on each side, so
   * keep it below `7.5cqi` horizontally and `3cqi` vertically (at 5/2).
   */
  xMove: string;
  yMove: string;
}

export type ParallaxImageProps = {
  /** Ordered back to front */
  layers: ParallaxLayer[];
  aspect: string;
  /** Rendered layer width, layers are 115% of the container */
  sizes: string;
  className?: string;
};

// Show the layers even if a load event goes missing
const REVEAL_TIMEOUT = 3000;

// Component
// ---------------
export const ParallaxImage = ({
  layers,
  aspect,
  sizes,
  className,
}: ParallaxImageProps) => {
  const [pending, setPending] = useState(layers.length);
  const handleSettled = () => setPending(n => n - 1);

  useEffect(() => {
    const timeout = setTimeout(() => setPending(0), REVEAL_TIMEOUT);
    return () => clearTimeout(timeout);
  }, []);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    delete container.dataset.leaving;
    const rect = container.getBoundingClientRect();

    // Pointer position from -1 (left/top) to 1 (right/bottom)
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    container.style.setProperty('--x', x.toFixed(2));
    container.style.setProperty('--y', y.toFixed(2));
  };

  // Also runs on `pointercancel`, which fires when a touch turns into a scroll
  const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.dataset.leaving = '';
    container.style.setProperty('--x', '0');
    container.style.setProperty('--y', '0');
  };

  return (
    <div
      aria-hidden="true"
      data-loaded={pending <= 0 || undefined}
      className={cn(
        // Allow vertical page scrolling when a touch starts on the image
        'group @container relative touch-pan-y overflow-hidden',
        'aspect-(--container-aspect) w-full',
        // Placeholder until the layers are revealed
        'bg-mist-800',
        className,
      )}
      style={toCSSVars({ x: 0, y: 0, containerAspect: aspect })}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      {/* Reveal all layers at once, so none of them pops in on its own */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-data-loaded:opacity-100">
        {layers.map(({ src, xMove, yMove }, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={0}
            height={0}
            sizes={sizes}
            // The back layer fills most of the frame, fetch it first
            preload={i === 0}
            loading={i === 0 ? undefined : 'eager'}
            onLoad={handleSettled}
            onError={handleSettled}
            className={cn(
              'pointer-events-none absolute object-cover select-none',
              // Oversized to allow the shift without revealing edges
              'top-1/2 left-1/2 h-[115%] w-[115%] max-w-none',
              // Layers move away from the pointer, the front ones further
              '[translate:calc(-50%-var(--x)*var(--x-move))_calc(-50%-var(--y)*var(--y-move))]',
              'transition-[translate] duration-400 ease-out will-change-[translate]',
              // Slower ease-out when pointer leaves
              'group-data-leaving:duration-600 group-data-leaving:ease-[cubic-bezier(0.22,1,0.36,1)]',
              // No pointer-driven movement for reduced motion
              'motion-reduce:[--x:0] motion-reduce:[--y:0]',
            )}
            style={toCSSVars({ xMove, yMove })}
          />
        ))}
      </div>
    </div>
  );
};
