import type { ReactNode } from 'react';

import { cn } from '@/lib/styles.utils';

import { Box } from './hud';
import { px } from './stage';

export interface LedgerProps {
  /** Label on the left, value on the right */
  rows: [label: ReactNode, value: ReactNode][];
  className?: string;
}

/**
 * Rows of a label and a value with a dot leader between them, the way an
 * arcade score table or an RPG status screen lines up its numbers: a
 * pixel dot every three stage pixels on the baseline, so the eye runs
 * from the word to its number.
 */
export const Ledger = ({ rows, className }: LedgerProps) => (
  <dl className={cn('m-0 grid gap-[calc(var(--px)*1.5)]', className)}>
    {rows.map(([label, value], i) => (
      <div key={i} className="flex items-baseline gap-[calc(var(--px)*2)]">
        <dt className="shrink-0">{label}</dt>
        <span
          aria-hidden
          className="min-w-[calc(var(--px)*6)] flex-1 self-end"
          style={{
            height: 'var(--px)',
            marginBottom: '0.3em',
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--pb-dim) 0 var(--px), transparent var(--px) calc(var(--px) * 3))',
          }}
        />
        <dd className="m-0 shrink-0 text-(--pb-heading) tabular-nums">
          {value}
        </dd>
      </div>
    ))}
  </dl>
);

export interface MeterProps {
  /** Boxes lit */
  value: number;
  /** Boxes in all */
  total: number;
  /** One box, in stage pixels */
  box?: { width: number; height: number };
  className?: string;
}

/**
 * A row of the bars' boxes, `value` of `total` lit in the player's gold
 * and the rest empty and dithered: how much of a pool is collected.
 */
export const Meter = ({
  value,
  total,
  box = { width: 4, height: 6 },
  className,
}: MeterProps) => (
  <span
    aria-hidden
    className={cn('inline-flex items-center', className)}
    style={{ gap: px(2), padding: px(1) }}
  >
    {Array.from({ length: total }, (_, i) => (
      <Box
        key={i}
        width={box.width}
        height={box.height}
        side={i < value ? 'player' : null}
      />
    ))}
  </span>
);
