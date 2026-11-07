'use client';

import { BitmapText, useInputKind } from '@sebald/blip-ui';

import { px } from './stage';
import { cn } from './styles.utils';

interface DemoLabelProps {
  /** Where its top sits on the stage */
  y: number;
  className?: string;
}

/**
 * The attract mode's label, the way an arcade cabinet marks its demo, in
 * the round call's pixel letters: `DEMO` in gold at the call's size and
 * the way in under it at the flawless line's size, gold too, blinking together
 * and slower than the title's call to play, centred over the room
 */
export const DemoLabel = ({ y, className }: DemoLabelProps) => {
  const kind = useInputKind();
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 grid animate-arcade-blink justify-items-center [--blink-low:0] motion-reduce:animate-none',
        className,
      )}
      style={{ top: px(y), animationDuration: '1.6s' }}
    >
      <BitmapText size="large">DEMO</BitmapText>
      <BitmapText className="mt-[calc(var(--px)*4)]">
        {kind === 'touch' ? 'TAP TO PLAY' : 'PRESS ENTER TO PLAY'}
      </BitmapText>
    </div>
  );
};
