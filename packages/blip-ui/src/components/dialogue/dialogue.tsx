import type { HTMLAttributes } from 'react';

import type { VariantProps } from '../../utils/styles';
import { dialogue } from './dialogue.styles';

type Variants = VariantProps<typeof dialogue.mark>;

export interface DialogueProps extends HTMLAttributes<HTMLParagraphElement> {
  /**
   * Whose line: `primary` is the player's, a gold mark in front of it;
   * `secondary` the opponent's, an ember one
   * @default 'primary'
   */
  tone?: NonNullable<Variants['tone']>;
  /**
   * A line that is over: the phrase being answered, the reply shown
   * @default false
   */
  muted?: boolean;
}

/** One spoken line, with its speaker's mark in front of it */
export const Dialogue = ({
  tone,
  muted = false,
  className,
  children,
  ...props
}: DialogueProps) => (
  <p className={dialogue.line({ muted, className })} {...props}>
    <span className={dialogue.mark({ tone })} aria-hidden />
    <span>{children}</span>
  </p>
);
