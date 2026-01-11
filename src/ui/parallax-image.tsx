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
    xOrigin?: string;
    yOrigin?: string;
    xMove?: string;
    yMove?: string;
  };
  className?: string;
}

export type ParallaxImageProps = {
  layers: ParallaxLayer[];
  width: string | number;
  aspect: string;
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
  width,
  aspect,
  className,
}: ParallaxImageProps) => {
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
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
    e.currentTarget.style.setProperty('--x', '0');
    e.currentTarget.style.setProperty('--y', '0');
  };

  return (
    <div
      className={cn(
        'relative touch-none overflow-hidden',
        'max-w-(--container-width) aspect-(--container-aspect) w-full',
        className,
      )}
      style={toCSSVars({
        x: 0,
        y: 0,
        containerWidth: width,
        containerAspect: aspect,
      })}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {layers.map(layer => (
        <Image
          {...layer}
          key={layer.id}
          alt={layer.alt || ''}
          placeholder="blur"
          className={cn(
            'pointer-events-none absolute select-none object-cover',
            'left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2',
            'transition-[object-position,translate] duration-300 ease-out will-change-transform',
            'w-(--width,auto) h-(--height,auto)',
            'object-[calc(var(--x-origin,50%)+calc(var(--x)*var(--x-move,0px)))_calc(var(--y-origin,50%)+calc(var(--y)*var(--y-move,0px)))]',
            layer.className,
          )}
          style={toCSSVars(layer.config)}
        />
      ))}
    </div>
  );
};
