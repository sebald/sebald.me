import type { ClassValue, CVA } from 'cva';
import { cva as _cva, cx } from 'cva';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Merge and deduplicate class names with Tailwind CSS support.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs));

export type { VariantProps } from 'cva';

/**
 * Enhanced cva with Tailwind CSS merge support.
 */
export const cva: CVA = (options) => {
  const cvaClassName = _cva(options);
  return (props) => twMerge(cvaClassName(props));
};

/**
 * Create dynamic spacing style object using CSS custom properties (--space).
 */
export const spacing = (value: string | number = 0) => {
  return {
    '--space': `calc(var(--spacing) * ${value})`,
  } as CSSProperties;
};
