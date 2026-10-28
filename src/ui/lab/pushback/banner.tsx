'use client';

import { cn } from '@/lib/styles.utils';

import { edgeMask } from './dither';
import { px } from './stage';
import { Loud } from './text';
import { useInputKind } from './use-input-kind';

/** The stripe's height and the dithered rows at each edge, in stage pixels */
const STRIPE = { height: 30, edge: 5 } as const;

interface BannerProps {
  /** Where the stripe's top sits on the stage */
  y: number;
  className?: string;
}

/**
 * The attract mode's banner, the way an arcade cabinet labels its demo:
 * a dark stripe across the stage with its top and bottom rows dithered
 * out, `DEMO` in gold on the left and the way in blinking on the right.
 * Opaque in the middle, so it reads over any room, the whiteboard too.
 */
export const Banner = ({ y, className }: BannerProps) => {
  const kind = useInputKind();
  const mask = edgeMask(STRIPE.height, STRIPE.edge);
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 flex items-center justify-between bg-(--pb-fill)/90 px-[calc(var(--px)*12)] uppercase',
        className,
      )}
      style={{
        top: px(y),
        height: px(STRIPE.height),
        maskImage: mask,
        maskSize: `${px(4)} ${px(STRIPE.height)}`,
        maskRepeat: 'repeat-x',
      }}
    >
      <span className="text-[2em] leading-none font-bold tracking-[0.15em] text-(--pb-gold)">
        Demo
      </span>
      <Loud className="font-semibold tracking-[0.1em] text-(--pb-heading) [--blink-low:0]">
        {kind === 'touch' ? 'Tap to play' : 'Press Enter to play'}
      </Loud>
    </div>
  );
};
