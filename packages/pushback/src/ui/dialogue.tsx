import type { CSSProperties, PropsWithChildren } from 'react';

import type { Side } from '../lib/duel';
import { cva } from './styles.utils';

const styles = {
  line: cva({
    // Held upright, a little more air between the mark and the words
    base: 'flex items-start gap-[calc(var(--px)*3)] tall:gap-[calc(var(--px)*3+3px)]',
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
  style?: CSSProperties;
}

/** One line of the duel, with its speaker's mark */
export const Dialogue = ({
  speaker,
  muted,
  className,
  style,
  children,
}: DialogueProps) => (
  <p className={styles.line({ muted, className })} style={style}>
    <span className={styles.speaker({ side: speaker })} aria-hidden />
    <span>{children}</span>
  </p>
);
