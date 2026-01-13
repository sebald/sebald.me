import type { ClassValue, CVA } from 'cva';
import { cva as _cva, cx } from 'cva';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';

import { toKebabCase } from '@/lib/string.utils';

/**
 * Merge and deduplicate class names with Tailwind CSS support.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs));

export type { VariantProps } from 'cva';

/**
 * Enhanced cva with Tailwind CSS merge support.
 */
export const cva: CVA = options => {
  const cvaClassName = _cva(options);
  return props => twMerge(cvaClassName(props));
};

/**
 * Transform a plain object into CSS variables.
 * - Prefixes keys with `--`
 * - Converts camelCase keys to kebab-case
 */
export const toCSSVars = (o: {
  [key: string]: string | number;
}): CSSProperties =>
  Object.fromEntries(
    Object.entries(o).map(([name, val]) => [`--${toKebabCase(name)}`, val]),
  ) as CSSProperties;
