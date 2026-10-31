import type { PropsWithChildren } from 'react';

import type { Side } from '@/lib/lab/pushback/duel';
import { cva } from '@/lib/styles.utils';

const styles = {
  line: cva({
    base: 'flex items-start gap-[calc(var(--px)*3)]',
    variants: { muted: { true: 'text-(--pb-muted)' } },
  }),
  speaker: cva({
    base: 'mt-[0.4em] inline-block size-[0.55em] shrink-0',
    variants: {
      side: { player: 'bg-(--pb-gold)', opponent: 'bg-(--pb-ember)' },
    },
  }),
};

export interface DialogueProps extends PropsWithChildren {
  /** Whose line: a gold or ember mark in front of it */
  speaker: Side;
  /** A line that is over: the phrase being answered, the reply shown */
  muted?: boolean;
  className?: string;
}

/** One line of the duel, with its speaker's mark */
export const Dialogue = ({
  speaker,
  muted,
  className,
  children,
}: DialogueProps) => (
  <p className={styles.line({ muted, className })}>
    <span className={styles.speaker({ side: speaker })} aria-hidden />
    <span>{children}</span>
  </p>
);
