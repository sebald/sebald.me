import type { PropsWithChildren } from 'react';
import { ViewTransition } from 'react';

// Pixelate filters
// ---------------
// CSS has no pixelate() filter, so these sample one pixel per block
// (feFlood + feComposite + feTile) and grow it to fill the block
// (feMorphology). They can't be animated, the keyframes in
// `transitions.css` step through them. Odd sizes grow the sampled pixel to
// exactly the block.
const BLOCKS = [3, 6, 13, 26];

export const PixelateFilters = () => (
  <svg aria-hidden="true" className="absolute size-0">
    <defs>
      {BLOCKS.map(size => (
        <filter
          key={size}
          id={`px-${size}`}
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feFlood
            x={Math.floor(size / 2)}
            y={Math.floor(size / 2)}
            width="1"
            height="1"
          />
          <feComposite width={size} height={size} />
          <feTile result="grid" />
          <feComposite in="SourceGraphic" in2="grid" operator="in" />
          <feMorphology operator="dilate" radius={Math.floor(size / 2)} />
        </filter>
      ))}
    </defs>
  </svg>
);

// PageTransition
// ---------------
// Pixelates the old page away and the new one in on client navigations.
// Wrap the outermost element of every page: layouts persist across
// navigations, so a boundary there never enters or exits.
export const PageTransition = ({ children }: PropsWithChildren) => (
  <ViewTransition enter="page-pixel" exit="page-pixel" default="none">
    {children}
  </ViewTransition>
);
