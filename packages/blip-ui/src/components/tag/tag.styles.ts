import { type ClassValue, cva } from '../../utils/styles';
import type { TagProps } from './tag';

/** A word set beside a name: smaller and bold, in its own colour */
export const tag = {
  root: cva({
    // Inline, in the name's line: a line under the name (a tab's focus)
    // runs on under it
    base: 'text-[0.75em] font-semibold',
    variants: {
      variant: {
        new: 'text-(--bui-secondary)',
        done: 'text-(--bui-muted)',
      } satisfies Record<NonNullable<TagProps['variant']>, ClassValue>,
    },
    defaultVariants: { variant: 'new' },
  }),
};
