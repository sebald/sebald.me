'use client';

import Image from 'next/image';
import type { CSSProperties, PointerEvent } from 'react';

import { cva, toCSSVars } from '@/lib/styles.utils';

// Config
// ---------------
const styles = cva({
  base: [
    'absolute object-cover pointer-events-none select-none',
    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none',
    'pointer-events-none object-cover',
    'transition-[object-position,translate] duration-300 ease-out will-change-transform',
    // Movement based on config
    'w-(--width,auto) h-(--height,auto)',
    'object-[calc(var(--x-origin,50%)+calc(var(--x)*var(--x-move,0px)))_calc(var(--y-origin,50%)+calc(var(--y)*var(--y-move,0px)))]',
  ],
});

const layers = [
  {
    id: 'background',
    speed: 0.2,
    src: '/0-background.webp',
    width: 1000,
    height: 1000,
    config: {
      width: '400px',
      xOrigin: '50%',
      yOrigin: '50%',
      xMove: '-10px',
      yMove: '-10px',
    },
  },
  {
    id: 'window',
    speed: 0.6,
    src: '/1-window.webp',
    width: 1000,
    height: 1000,
    config: {
      width: '400px',
      xOrigin: '50%',
      yOrigin: '50%',
      xMove: '-15px',
      yMove: '-15px',
    },
  },
  {
    id: 'person',
    speed: 1.5,
    src: '/2-person.webp',
    width: 1000,
    height: 1000,
    config: {
      width: '450px',
      xOrigin: '50%',
      yOrigin: '50%',
      xMove: '-50px',
      yMove: '-30px',
    },
  },
];

// Helpers
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

// Component
// ---------------
export const Avatar = () => {
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();

    // Relative pointer position to the container
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Map to -1 to 1 range
    const x = mapRange(0, rect.width, -1, 1, offsetX);
    const y = mapRange(0, rect.height, -1, 1, offsetY);

    container.style.setProperty('--x', x.toFixed(2));
    container.style.setProperty('--y', y.toFixed(2));
  };

  // Reset to center
  const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--x', '0');
    e.currentTarget.style.setProperty('--y', '0');
  };

  return (
    <div
      className="aspect-5/6 w-87.5 relative touch-none overflow-hidden rounded-2xl"
      style={toCSSVars({
        x: 0,
        y: 0,
      })}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {layers.map(layer => (
        <Image
          key={layer.id}
          src={layer.src}
          alt=""
          width={layer.width}
          height={layer.height}
          className={styles()}
          style={toCSSVars(layer.config)}
        />
      ))}
    </div>
  );
};
