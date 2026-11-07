import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/styles.utils';

/** The shared look of the inventory's forms */
export const field = {
  form: 'flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-mist-950 p-4 font-mono text-sm',
  input: 'rounded-md bg-mist-900 px-2 py-1 text-mist-100 ring-1 ring-mist-700',
};

export const Field = ({
  label,
  children,
}: PropsWithChildren<{ label: string }>) => (
  <label className="flex items-center gap-2 text-mist-300">
    {label}
    {children}
  </label>
);

/** A patch of the stage's floor to stand things on, in `--px` units */
export const Floor = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn('w-fit bg-(--pb-floor) p-[calc(var(--px)*6)]', className)}
    style={{
      backgroundImage:
        'linear-gradient(var(--pb-wall), var(--pb-wall) calc(100% - var(--px) * 12), var(--pb-floor) calc(100% - var(--px) * 12))',
    }}
  >
    {children}
  </div>
);
