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
 * The attract mode's label, the way an arcade cabinet stamps its demo:
 * `DEMO` in big solid gold with a hard ink outline and drop like the
 * logo, and the way in under it, blinking, outlined the same, centred
 * over the room so it reads over the lightest wall.
 */
export const DemoLabel = ({ y, className }: DemoLabelProps) => {
  const kind = useInputKind();
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 flex flex-col items-center gap-[calc(var(--px)*4)] text-center uppercase',
        className,
      )}
      style={{ top: px(y) }}
    >
      <span
        className="text-[5em] leading-none font-bold tracking-[0.12em] text-(--pb-gold)"
        style={{ textShadow: outline(2, 2) }}
      >
        Demo
      </span>
      <Loud
        className="text-[1.1em] font-bold tracking-[0.12em] text-(--pb-heading) [--blink-low:0]"
        style={{ textShadow: outline(1, 1) }}
      >
        {kind === 'touch' ? 'Tap to play' : 'Press Enter to play'}
      </Loud>
    </div>
  );
};
