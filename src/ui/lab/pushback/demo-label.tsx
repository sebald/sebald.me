'use client';

import { cn } from '@/lib/styles.utils';

import { PALETTE } from './palette';
import { px } from './stage';
import { Loud } from './text';
import { useInputKind } from './use-input-kind';

/**
 * A hard pixel outline in ink round letters, `width` stage pixels all
 * round, and a drop of `drop` more straight down, like the logo's: no
 * blur, so it is ink on the grid, not a shadow
 */
const outline = (width: number, drop: number) => {
  const rings: string[] = [];
  for (let dx = -width; dx <= width; dx++)
    for (let dy = -width; dy <= width + drop; dy++)
      if (dx !== 0 || dy !== 0)
        rings.push(`${px(dx)} ${px(dy)} 0 ${PALETTE.ink}`);
  return rings.join(', ');
};

interface DemoLabelProps {
  /** Where its top sits on the stage */
  y: number;
  className?: string;
}

/**
 * The attract mode's label, the way an arcade cabinet marks its demo:
 * `DEMO` and the way in, one size, slanted, in gold with a hard ink outline and
 * drop like the logo's, blinking together, centred over the room so it
 * reads over the lightest wall without taking the scene over.
 */
export const DemoLabel = ({ y, className }: DemoLabelProps) => {
  const kind = useInputKind();
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-x-0', className)}
      style={{ top: px(y) }}
    >
      <Loud
        className="flex flex-col items-center gap-[calc(var(--px)*2)] text-center text-[1.6em] leading-none font-bold tracking-[0.12em] text-(--pb-gold) uppercase italic [--blink-low:0]"
        style={{ textShadow: outline(1, 1) }}
      >
        <span>Demo</span>
        <span>{kind === 'touch' ? 'Tap to play' : 'Press Enter to play'}</span>
      </Loud>
    </div>
  );
};
