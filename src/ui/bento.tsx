import NextImage from 'next/image';
import type { PropsWithChildren } from 'react';

import type { VariantProps } from '@/lib/styles.utils';
import { cva } from '@/lib/styles.utils';

// Styles
// ---------------
// A 12:5 collage of four pictures. Each layout names its grid areas `a` to
// `d`, and the tiles fill them in reading order; a tile only fills the
// cell it gets
const styles = {
  root: cva({
    base: [
      'grid aspect-12/5 w-full grid-rows-2 gap-1.5',
      '[&>[data-slot=bento-tile]:nth-child(1)]:[grid-area:a]',
      '[&>[data-slot=bento-tile]:nth-child(2)]:[grid-area:b]',
      '[&>[data-slot=bento-tile]:nth-child(3)]:[grid-area:c]',
      '[&>[data-slot=bento-tile]:nth-child(4)]:[grid-area:d]',
    ],
    variants: {
      layout: {
        // The large tile on the left, one wide and two small ones beside it
        'hero-and-three': [
          'grid-cols-[4fr_3fr_2fr]',
          "[grid-template-areas:'a_b_b'_'a_c_d']",
        ],
        // A square hero, a wide strip over two small squares
        'four-piece': [
          'grid-cols-[2fr_2fr_1fr_1fr]',
          "[grid-template-areas:'a_a_b_b'_'a_a_c_d']",
        ],
        // One wide picture over a row of three small ones
        'film-strip': [
          'grid-cols-3 grid-rows-[3fr_1.15fr]',
          "[grid-template-areas:'a_a_a'_'b_c_d']",
        ],
        // The large tile in the middle, a tall one on the left, two small
        // ones on the right
        'center-stage-left': [
          'grid-cols-[2fr_5fr_2fr]',
          "[grid-template-areas:'a_b_c'_'a_b_d']",
        ],
        // Two small tiles on the left, the large one in the middle, a tall
        // one on the right
        'center-stage-right': [
          'grid-cols-[2fr_5fr_2fr]',
          "[grid-template-areas:'a_c_d'_'b_c_d']",
        ],
      },
    },
    defaultVariants: {
      layout: 'hero-and-three',
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
export type BentoLayout = NonNullable<
  VariantProps<typeof styles.root>['layout']
>;

export interface BentoProps
  extends PropsWithChildren, VariantProps<typeof styles.root> {
  className?: string;
}

/** Every layout takes four tiles, placed in reading order */
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
  sizes = '(min-width: 768px) 480px, 66vw',
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
