'use client';

import { GOLD, SIZE, SPARK, Word } from './round-call';
import { px } from './stage';
import { cn } from './styles.utils';
import { useInputKind } from './use-input-kind';

interface DemoLabelProps {
  /** Where its top sits on the stage */
  y: number;
  className?: string;
}

/**
 * The attract mode's label, the way an arcade cabinet marks its demo, in
 * the round call's pixel letters: `DEMO` in gold at the call's size and
 * the way in under it at the flawless line's, white, blinking together
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
      <Word word="DEMO" size={SIZE.win} ramp={GOLD} />
      <Word
        word={kind === 'touch' ? 'TAP TO PLAY' : 'PRESS ENTER TO PLAY'}
        size={SIZE.line}
        ramp={SPARK}
        className="mt-[calc(var(--px)*4)]"
      />
    </div>
  );
};
