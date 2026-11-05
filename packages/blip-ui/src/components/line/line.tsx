import type { HTMLAttributes } from 'react';

import type { VariantProps } from '../../utils/styles';
import { line } from './line.styles';

type Variants = VariantProps<typeof line.mark>;

export interface LineProps extends HTMLAttributes<HTMLParagraphElement> {
  /**
   * Whose line: `primary` is the side the screen is about (the player), a
   * gold mark; `secondary` the other side, an ember one
   * @default 'primary'
   */
  variant?: NonNullable<Variants['variant']>;
  /**
   * Said already: the line being answered, a reply shown. Quieter, so
   * the live one stands out
   * @default false
   */
  past?: boolean;
}

/** One line of a conversation, with its speaker's mark in front of it */
export const Line = ({
  variant,
  past = false,
  className,
  children,
  ...props
}: LineProps) => (
  <p className={line.line({ past, className })} {...props}>
    <span className={line.mark({ variant })} aria-hidden />
    <span>{children}</span>
  </p>
);
