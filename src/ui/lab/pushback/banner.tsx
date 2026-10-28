'use client';

import { cn } from '@/lib/styles.utils';

import { edgeMask } from './dither';
import { px } from './stage';
import { useInputKind } from './use-input-kind';

/** The stripe's height and the dithered rows at each edge, in stage pixels */
const STRIPE = { height: 26, edge: 4 } as const;

/** Times the message repeats in each half of the ticker: wider than the stage */
const REPEATS = 4;

interface BannerProps {
  /** Where the stripe's top sits on the stage */
  y: number;
  className?: string;
}

/** Between two messages on the ticker: a pixel diamond in ember */
const Gem = () => (
  <span
    aria-hidden
    className="inline-block size-[calc(var(--px)*5)] bg-(--pb-ember) [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]"
  />
);

/**
 * The attract mode's banner, the way an arcade cabinet labels its demo:
 * a pale stripe across the stage with its top and bottom rows dithered
 * out, and a ticker running along it from right to left, `DEMO` and the
 * way in, again and again. Opaque in the middle, so it reads over any
 * room; under reduced motion the ticker stands still, centred.
 */
export const Banner = ({ y, className }: BannerProps) => {
  const kind = useInputKind();
  const call = kind === 'touch' ? 'Tap to play' : 'Press Enter to play';
  const message = (key: number) => (
    <span
      key={key}
      className="flex shrink-0 items-center gap-[calc(var(--px)*8)] pr-[calc(var(--px)*8)]"
    >
      <span className="text-[1.5em] leading-none font-bold tracking-[0.15em] text-(--pb-ember-shade)">
        Demo
      </span>
      <Gem />
      <span className="font-semibold tracking-[0.1em]">{call}</span>
      <Gem />
    </span>
  );
  const half = (from: number) => (
    <span className="flex shrink-0">
      {Array.from({ length: REPEATS }, (_, i) => message(from + i))}
    </span>
  );
  const mask = edgeMask(STRIPE.height, STRIPE.edge);
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 flex items-center overflow-hidden bg-(--pb-paper) text-(--pb-ink) uppercase',
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
      <span className="flex w-max animate-arcade-marquee motion-reduce:hidden">
        {half(0)}
        {half(REPEATS)}
      </span>
      {/* Still, once, centred */}
      <span className="hidden w-full justify-center motion-reduce:flex">
        {message(0)}
      </span>
    </div>
  );
};
