import type { ClassValue } from 'cva';
import { cx } from 'cva';
import { defineConfig } from 'cva/config';
import { extendTailwindMerge } from 'tailwind-merge';

import { SPACING } from '../foundations/pixel';

// The spacing roles are spacing to it, so `p-4` from a caller replaces `p-window`
const twMerge = extendTailwindMerge({
  extend: { theme: { spacing: Object.keys(SPACING) } },
});

/** Merge and deduplicate class names, later Tailwind classes winning */
export const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs));

export type { ClassValue, VariantProps } from 'cva';

/** cva that merges its classes with `cn` */
export const { cva } = defineConfig({ cx: cn });
