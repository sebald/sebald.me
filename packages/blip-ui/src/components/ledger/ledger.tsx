import type { HTMLAttributes, ReactNode } from 'react';

import { ledger } from './ledger.styles';

export interface LedgerProps extends HTMLAttributes<HTMLDListElement> {
  /** The rows, `LedgerRow`s */
  children: ReactNode;
}

/**
 * Rows of a label and a value with a dot leader between them, the way an
 * arcade score table or a status screen lines up its numbers: a pixel dot
 * every three stage pixels on the baseline, so the eye runs from the word
 * to its number. A description list (`dl`), since each row is a term and
 * its one value; a table would promise columns to compare.
 */
export const Ledger = ({ className, children, ...props }: LedgerProps) => (
  <dl data-slot="ledger" className={ledger.root({ className })} {...props}>
    {children}
  </dl>
);

export interface LedgerRowProps {
  /** What is counted, on the left */
  label: ReactNode;
  /** Its value, on the right: a number, a `Meter` */
  children: ReactNode;
  className?: string;
}

/** One row of a Ledger: the label, the leader, the value */
export const LedgerRow = ({ label, className, children }: LedgerRowProps) => (
  <div data-slot="ledger-row" className={ledger.row({ className })}>
    <dt className={ledger.label()}>{label}</dt>
    <span aria-hidden className={ledger.leader()} />
    <dd className={ledger.value()}>{children}</dd>
  </div>
);
