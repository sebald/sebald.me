import type { PropsWithChildren, ReactNode } from 'react';

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

type SelectOption<T> = T | readonly [value: T, label: ReactNode];

/**
 * A labelled select of the inventory's forms. `options` are values, shown
 * as they are, or `[value, label]` pairs; `onChange` gets the value back
 * in its own type, a number as a number
 */
export const Select = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
}) => {
  const entries = options.map(
    option =>
      (Array.isArray(option) ? option : [option, String(option)]) as readonly [
        T,
        ReactNode,
      ],
  );
  return (
    <Field label={label}>
      <select
        className={field.input}
        value={value}
        onChange={e => {
          const picked = entries.find(([v]) => String(v) === e.target.value);
          if (picked) onChange(picked[0]);
        }}
      >
        {entries.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </Field>
  );
};

/** The zoom a demo is drawn at, as `2x`, `3x`, … */
export const ScaleSelect = ({
  value,
  scales,
  onChange,
}: {
  value: number;
  scales: readonly number[];
  onChange: (scale: number) => void;
}) => (
  <Select
    label="Scale"
    value={value}
    options={scales.map(n => [n, `${n}x`] as const)}
    onChange={onChange}
  />
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
