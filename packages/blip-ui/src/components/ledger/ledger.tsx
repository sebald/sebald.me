import type { HTMLAttributes, ReactNode } from 'react';

import { ledger } from './ledger.styles';

export interface LedgerProps extends Omit<
  HTMLAttributes<HTMLDListElement>,
  'children'
> {
  /** Label on the left, value on the right */
  rows: [label: ReactNode, value: ReactNode][];
}

/**
 * Rows of a label and a value with a dot leader between them, the way an
 * arcade score table or a status screen lines up its numbers: a pixel dot
 * every three stage pixels on the baseline, so the eye runs from the word
 * to its number. A description list (`dl`), since each row is a term and
 * its one value; a table would promise columns to compare.
 */
export const Ledger = ({ rows, className, ...props }: LedgerProps) => (
  <dl className={ledger.root({ className })} {...props}>
    {rows.map(([label, value], i) => (
      <div key={i} className={ledger.row()}>
        <dt className={ledger.label()}>{label}</dt>
        <span aria-hidden className={ledger.leader()} />
        <dd className={ledger.value()}>{value}</dd>
      </div>
    ))}
  </dl>
);
