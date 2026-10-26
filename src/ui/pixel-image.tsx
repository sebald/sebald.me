'use client';

import NextImage from 'next/image';
import type { MouseEvent, PointerEvent } from 'react';
import { useRef, useState } from 'react';

import { trackEvent } from '@/lib/analytics';
import type { Hotspot } from '@/lib/hotspots';
import { hotspotAt } from '@/lib/hotspots';
import { cva } from '@/lib/styles.utils';
import { playTap } from '@/lib/tap';
import { useImagesSettled } from '@/ui/use-images-settled';

// Styles
// ---------------
const style = {
  root: cva({
    base: [
      'group relative w-full overflow-hidden',
      // Placeholder until the image is revealed
      'bg-mist-800',
    ],
  }),
  // Positioned, so the `fill` image inside can size to it
  picture: cva({
    base: [
      'absolute inset-0',
      'opacity-0 transition-opacity duration-500 ease-out group-data-loaded:opacity-100',
    ],
  }),
  // Smooth scaling on purpose: the image is pre-scaled with hard edges to
  // cover the widest header on a 2x screen, so the browser only scales down
  // and every art pixel stays the same size (`pixelated` would round them to
  // uneven widths)
  image: cva({
    base: ['object-cover'],
  }),
  // Takes the pointer over the whole scene, the hotspots are hit-tested
  scene: cva({
    base: ['absolute inset-0 cursor-crosshair'],
  }),
  // The sentence line of the adventure games: the object under the pointer,
  // or what is said about it
  line: cva({
    base: [
      'pointer-events-none absolute inset-x-0 bottom-0 px-4 pt-10 pb-3 md:pb-4',
      'bg-linear-to-t from-mist-950/80 to-transparent',
      'text-center font-mono text-xs text-balance md:text-sm',
      '[text-shadow:0_1px_0_var(--color-mist-950)]',
      'transition-opacity duration-150',
    ],
    variants: {
      shown: {
        true: 'opacity-100',
        false: 'opacity-0',
      },
      // The name is the game talking, the remark is someone in the scene
      remark: {
        true: 'text-mist-50',
        false: 'text-mist-300',
      },
    },
  }),
};

// Props
// ---------------
export interface PixelImageProps {
  /**
   * Pixel art pre-scaled by a whole number with nearest-neighbour (to at
   * least 1600px wide), usually an animated WebP
   */
  src: string;
  /**
   * Still frame shown instead of `src` for reduced motion, the animation is
   * then never downloaded
   */
  poster: string;
  aspect: string;
  /** Hidden objects: hover names them, click remarks on them */
  hotspots?: Hotspot[];
  className?: string;
}

// Component
// ---------------
export const PixelImage = ({
  src,
  poster,
  aspect,
  hotspots,
  className,
}: PixelImageProps) => {
  const [loaded, handleSettled] = useImagesSettled(1);
  const [hovered, setHovered] = useState<Hotspot>();
  const [remarked, setRemarked] = useState<Hotspot>();
  const looked = useRef(new Set<string>());

  const spotAt = (e: MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return hotspotAt(
      hotspots ?? [],
      ((e.clientX - box.left) / box.width) * 100,
      ((e.clientY - box.top) / box.height) * 100,
    );
  };

  // A remark stays while the pointer wanders off its object, until it
  // reaches another one
  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const spot = spotAt(e);
    setHovered(spot);
    if (spot && spot !== remarked) setRemarked(undefined);
  };

  // Touch has no hover, a tap goes straight to the remark
  const handleLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    setHovered(undefined);
    setRemarked(undefined);
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const spot = spotAt(e);
    setRemarked(spot);
    if (!spot) return;
    playTap();
    if (looked.current.has(spot.name)) return;
    looked.current.add(spot.name);
    trackEvent('Look At', { object: spot.name });
  };

  const line = remarked
    ? `“${remarked.remark}”`
    : hovered
      ? `Look at ${hovered.name}`
      : undefined;

  return (
    <div
      aria-hidden="true"
      data-loaded={loaded || undefined}
      className={style.root({ className })}
      style={{ aspectRatio: aspect }}
    >
      <picture className={style.picture()}>
        <source media="(prefers-reduced-motion: reduce)" srcSet={poster} />
        <NextImage
          src={src}
          alt=""
          fill
          // No `preload`: its link tag ignores the reduced-motion source and
          // would fetch the animation for everyone
          loading="eager"
          fetchPriority="high"
          // Resizing would blur the pixels, and the optimizer passes animated
          // images through at full size anyway
          unoptimized
          onLoad={handleSettled}
          onError={handleSettled}
          className={style.image()}
        />
      </picture>
      {hotspots?.length ? (
        // A pointer-only extra: the scene is hidden from assistive technology
        // and the remarks carry nothing the note doesn't
        // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className={style.scene()}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          onClick={handleClick}
        >
          <p
            className={style.line({
              shown: Boolean(line),
              remark: Boolean(remarked),
            })}
          >
            {line}
          </p>
        </div>
      ) : null}
    </div>
  );
};
