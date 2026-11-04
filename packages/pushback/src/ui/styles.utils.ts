import type { ClassValue } from 'cva';
import { cx } from 'cva';
import { defineConfig } from 'cva/config';
import { twMerge } from 'tailwind-merge';

/** Merge and deduplicate class names, later Tailwind classes winning */
export const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs));

export type { VariantProps } from 'cva';

/** cva that merges its classes with `cn` */
export const { cva } = defineConfig({ cx: cn });
