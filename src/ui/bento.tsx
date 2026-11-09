import NextImage from 'next/image';
import type { PropsWithChildren } from 'react';

import type { VariantProps } from '@/lib/styles.utils';
import { cva } from '@/lib/styles.utils';

// Styles
// ---------------
// A 4:3 grid of three pictures, one large and two small, sized unevenly so
// it reads as a collage, not a table. The grid places the tiles by their
// slot; a tile only fills the cell it gets
const styles = {
  root: cva({
    base: ['grid aspect-4/3 w-full gap-1.5'],
    variants: {
      layout: {
        // The large tile on the left, two of different heights beside it
        side: [
          'grid-cols-[3fr_2fr] grid-rows-[3fr_2fr]',
          '[&>[data-slot=bento-tile]:first-child]:row-span-2',
        ],
        // The large tile across the top, two of different widths below it
        top: [
          'grid-cols-[3fr_2fr] grid-rows-[3fr_2fr]',
          '[&>[data-slot=bento-tile]:first-child]:col-span-2',
        ],
      },
    },
    defaultVariants: {
      layout: 'side',
    },
  }),
  tile: cva({
    base: ['group/tile relative overflow-hidden rounded-lg bg-mist-800'],
  }),
  // The picture inside the frame comes a little closer while the pointer
  // is over this tile, the frame and its edge stay put
  picture: cva({
    base: [
      'object-cover',
      'motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out',
      'motion-safe:group-hover/tile:scale-105',
    ],
  }),
};

// Bento
// ---------------
export interface BentoProps
  extends PropsWithChildren, VariantProps<typeof styles.root> {
  className?: string;
}

const Root = ({ layout, className, children }: BentoProps) => (
  <span data-slot="bento" className={styles.root({ layout, className })}>
    {children}
  </span>
);

// Bento.Tile
// ---------------
export interface BentoTileProps {
  src: string;
  /** Leave empty when the pictures only repeat what the text says */
  alt?: string;
  /** How wide the tile is shown, for picking the image size */
  sizes?: string;
  className?: string;
}

const Tile = ({
  src,
  alt = '',
  sizes = '(min-width: 640px) 180px, 60vw',
  className,
}: BentoTileProps) => (
  <span data-slot="bento-tile" className={styles.tile({ className })}>
    <NextImage
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={styles.picture()}
    />
  </span>
);

// Bento API
// ---------------
export const Bento = Object.assign(Root, { Tile });
