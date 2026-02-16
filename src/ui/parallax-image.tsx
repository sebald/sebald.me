'use client';

import type { ImageProps } from 'next/image';
import Image from 'next/image';
import type { PointerEvent } from 'react';

import { cn, toCSSVars } from '@/lib/styles.utils';

// Types
// ---------------
export interface ParallaxLayer extends Omit<ImageProps, 'alt'> {
  id: string;
  alt?: string;
  config: {
    width?: string;
    height?: string;
    xOrigin?: string;
    yOrigin?: string;
    xMove?: string;
    yMove?: string;
  };
  className?: string;
}

export type ParallaxImageProps = {
  layers: ParallaxLayer[];
  aspect: string;
  scale?: string;
  className?: string;
};

// Helper
// ---------------
// Maps a number's relative placement within one range to the equivalent position in another range.
const mapRange = (
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  value: number,
) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const ParallaxImage = ({
  layers,
  aspect,
  scale,
  className,
}: ParallaxImageProps) => {
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    delete container.dataset.leaving;
    const rect = container.getBoundingClientRect();

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    /**
     * Reset if pointer is outside of the container. This happens
     * when using touch and the user scrolls while touching the element.
     */
    if (
      offsetX < 0 ||
      offsetX > rect.width ||
      offsetY < 0 ||
      offsetY > rect.height
    ) {
      container.style.setProperty('--x', '0');
      container.style.setProperty('--y', '0');
      return;
    }

    const x = mapRange(0, rect.width, -1, 1, offsetX);
    const y = mapRange(0, rect.height, -1, 1, offsetY);

    container.style.setProperty('--x', x.toFixed(2));
    container.style.setProperty('--y', y.toFixed(2));
  };

  const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.dataset.leaving = '';
    container.style.setProperty('--x', '0');
    container.style.setProperty('--y', '0');
  };

  return (
    <div
      className={cn(
        'group @container relative touch-none overflow-hidden',
        'aspect-(--container-aspect) w-full',
        className,
      )}
      style={toCSSVars({
        x: 0,
        y: 0,
        containerAspect: aspect,
        ...(scale && { scale }),
      })}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {layers.map(({ alt, className, config, fill, ...rest }) => {
        const widthPct = parseFloat(config.width || scale || '115');
        const heightPct = parseFloat(config.height || scale || '115');
        const maxXMove = (widthPct - 100) / 2;
        const maxYMove = (heightPct - 100) / 2;
        return (
          <Image
            width={0}
            height={0}
            sizes="100vw"
            {...rest}
            key={rest.id}
            alt={alt || ''}
            className={cn(
              'pointer-events-none absolute object-cover select-none',
              'top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2',
              'transition-[object-position,translate] duration-400 ease-out will-change-transform',
              'group-data-leaving:duration-600 group-data-leaving:ease-[cubic-bezier(0.22,1,0.36,1)]',
              'h-(--height,var(--scale,115%)) w-(--width,var(--scale,115%))',
              'object-[calc(var(--x-origin,50%)+clamp(calc(-1cqi*var(--max-x-move,7.5)),calc(var(--x)*var(--x-move,0cqi)),calc(1cqi*var(--max-x-move,7.5))))_calc(var(--y-origin,50%)+clamp(calc(-1cqi*var(--max-y-move,7.5)),calc(var(--y)*var(--y-move,0cqi)),calc(1cqi*var(--max-y-move,7.5))))]',
              className,
            )}
            style={toCSSVars({ ...config, maxXMove, maxYMove })}
          />
        );
      })}
    </div>
  );
};
