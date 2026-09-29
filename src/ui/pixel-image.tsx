'use client';

import NextImage from 'next/image';

import { cva } from '@/lib/styles.utils';
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
  // Smooth scaling on purpose: the image is already pre-scaled with hard
  // edges, so the browser only covers the last small step and every art pixel
  // stays the same size (`pixelated` would round them to uneven widths)
  image: cva({
    base: ['object-cover'],
  }),
};

// Props
// ---------------
export interface PixelImageProps {
  /**
   * Pixel art pre-scaled by a whole number with nearest-neighbour (3x for the
   * 720px column), usually an animated WebP
   */
  src: string;
  /**
   * Still frame shown instead of `src` for reduced motion, the animation is
   * then never downloaded
   */
  poster: string;
  aspect: string;
  className?: string;
}

// Component
// ---------------
export const PixelImage = ({
  src,
  poster,
  aspect,
  className,
}: PixelImageProps) => {
  const [loaded, handleSettled] = useImagesSettled(1);

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
    </div>
  );
};
