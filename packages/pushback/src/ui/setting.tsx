import type { ReactNode } from 'react';

import { cn } from './styles.utils';

/** Left or right of a setting's value: a pixel triangle, dim at an end */
const Step = ({ left, more }: { left: boolean; more: boolean }) => (
  <span
    aria-hidden
    className={cn(
      'inline-block h-[calc(var(--px)*5)] w-[calc(var(--px)*3)] bg-current',
      left
        ? '[clip-path:polygon(100%_0,0_50%,100%_100%)]'
        : '[clip-path:polygon(0_0,100%_50%,0_100%)]',
      more ? 'opacity-100' : 'opacity-25',
    )}
  />
);

/**
 * A setting's value between its arrows, pushed to the row's end, on
 * every menu row that is a setting, even one of two values (on and off),
 * so they all read and work alike. A choice goes round, left and right
 * have no end, so both arrows are lit; `first` and `last` are for a
 * range (a volume), which stops at its ends and dims the arrow there.
 */
export const Setting = ({
  children,
  first = false,
  last = false,
}: {
  children: ReactNode;
  first?: boolean;
  last?: boolean;
}) => (
  <span className="ml-auto flex items-center gap-[calc(var(--px)*2)]">
    <Step left more={!first} />
    <span className="w-[6ch] text-center">{children}</span>
    <Step left={false} more={!last} />
  </span>
);
