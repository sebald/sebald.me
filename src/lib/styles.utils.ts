import type { ClassValue } from 'cva';
import { cx } from 'cva';
import { defineConfig } from 'cva/config';
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
export const { cva } = defineConfig({ cx: cn });

/**
 * Merge a component's own classes with a consumer `className`. The consumer
 * classes come last, so they win conflicts.
 *
 * Also supports Base UI's function form (`className={state => ...}`), which
 * is resolved with the component state before merging.
 */
export function mergeClassName(base: string, className?: string): string;
export function mergeClassName<State>(
  base: string,
  className?: string | ((state: State) => string | undefined),
): string | ((state: State) => string);
export function mergeClassName<State>(
  base: string,
  className?: string | ((state: State) => string | undefined),
) {
  return typeof className === 'function'
    ? (state: State) => cn(base, className(state))
    : cn(base, className);
}

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
