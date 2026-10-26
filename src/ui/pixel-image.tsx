'use client';

import NextImage from 'next/image';
import type { MouseEvent, PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

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
  // Takes the pointer over the whole scene, the hotspots are hit-tested.
  // Only for a mouse or trackpad: without hover there is nothing to
  // discover, so touch screens just see the scene
  scene: cva({
    base: [
      'group/scene absolute inset-0 hidden cursor-crosshair pointer-fine:block',
    ],
  }),
  // Rises softly as soon as the pointer enters the scene, so the sentence
  // line has something to sit on
  scrim: cva({
    base: [
      'pointer-events-none absolute inset-x-0 bottom-0 h-1/4 min-h-12 ui-scrim [--scrim-strength:0.75]',
      'opacity-0 motion-safe:translate-y-3',
      'transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
      'group-hover/scene:translate-y-0 group-hover/scene:opacity-100',
    ],
  }),
  // The sentence line of the adventure games. It only fades in and out with
  // the pointer entering and leaving the scene (a beat after the scrim on
  // the way in); inside, the words swap instantly, like in the games
  line: cva({
    base: [
      'pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-3 md:pb-4',
      'text-center font-mono text-xs text-balance md:text-sm',
      '[text-shadow:0_1px_0_var(--color-mist-950)]',
      'transition-opacity duration-300',
      'opacity-0 group-hover/scene:opacity-100 group-hover/scene:delay-100',
    ],
    variants: {
      // One colour for the game's line, whether it says "Look at …" (there is
      // something to look at, but not what) or names an object. A remark is
      // someone in the scene speaking, brighter
      remark: {
        true: 'text-mist-50',
        false: 'text-mist-200',
      },
    },
  }),
};

// Config
// ---------------
// How long a remark stays, like speech in the adventure games: long enough
// to read, then the sentence line comes back
const readingTime = (text: string) => Math.max(2500, text.length * 60);

// Props
// ---------------
export interface PixelImageProps {
  /**
   * Pixel art pre-scaled by a whole number with nearest-neighbour (to at
   * least 1440px wide), usually an animated WebP
   */
  src: string;
  /**
   * Still frame shown instead of `src` for reduced motion, the animation is
   * then never downloaded
   */
  poster: string;
  aspect: string;
  /**
   * Hidden objects: hover names them, click remarks on them (mouse and
   * trackpad only)
   */
  hotspots?: Hotspot[];
  className?: string;
}

// Component
// ---------------
export const PixelImage = ({
  src,
  poster,
  aspect,
  hotspots = [],
  className,
}: PixelImageProps) => {
  const [loaded, handleSettled] = useImagesSettled(1);
  // Name of the object under the pointer
  const [hovered, setHovered] = useState<string>();
  const [remarked, setRemarked] = useState<Hotspot>();
  // Ends the remark after its reading time, restarted by every click
  const silence = useRef<ReturnType<typeof setTimeout>>(undefined);
  const looked = useRef(new Set<string>());

  useEffect(() => () => clearTimeout(silence.current), []);

  const spotAt = (e: MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return hotspotAt(
      hotspots,
      ((e.clientX - box.left) / box.width) * 100,
      ((e.clientY - box.top) / box.height) * 100,
    );
  };

  // A remark stays for its reading time while the pointer wanders off its
  // object, and makes way as soon as the pointer reaches another one
  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const spot = spotAt(e);
    setHovered(spot?.name);
    if (spot && spot !== remarked) setRemarked(undefined);
  };

  // A fresh line for every visit. Leaving keeps the last words, so they fade
  // out as they were instead of flashing back to "Look at …"
  const handleEnter = () => {
    setHovered(undefined);
    setRemarked(undefined);
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const spot = spotAt(e);
    clearTimeout(silence.current);
    setRemarked(spot);
    if (!spot) return;
    silence.current = setTimeout(
      () => setRemarked(undefined),
      readingTime(spot.remark),
    );
    playTap();
    if (looked.current.has(spot.name)) return;
    looked.current.add(spot.name);
    trackEvent('Look At', { object: spot.name });
  };

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
      {hotspots.length ? (
        // A pointer-only extra: the scene is hidden from assistive technology
        // and the remarks carry nothing the note doesn't
        // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className={style.scene()}
          onPointerEnter={handleEnter}
          onPointerMove={handleMove}
          onClick={handleClick}
        >
          <div className={style.scrim()} />
          <p className={style.line({ remark: Boolean(remarked) })}>
            {remarked ? `“${remarked.remark}”` : `Look at ${hovered ?? '…'}`}
          </p>
        </div>
      ) : null}
    </div>
  );
};
