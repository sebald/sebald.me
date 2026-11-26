import { type ClassValue, cva } from '../../utils/styles';
import type { StepProps } from './setting';

export const setting = {
  root: cva({
    // The arrows a gap from the value, so even a value of six characters
    // stands clear of them; the same in a menu and in a form
    base: 'ml-auto flex items-center gap-regular',
  }),
  /** Left or right of the value: a pixel triangle, dim at the end it cannot go past */
  step: cva({
    base: 'inline-block h-[calc(var(--bui-px)*5)] w-[calc(var(--bui-px)*3)]',
    variants: {
      points: {
        left: 'bui-point-left',
        right: 'bui-point-right',
      } satisfies Record<NonNullable<StepProps['points']>, ClassValue>,
      more: { true: '', false: 'bui-disabled' },
    },
  }),
  /**
   * Centred in six characters, so the arrows stay put as it changes; a
   * longer value grows to the left. A `Stepper`'s value is this one
   */
  value: cva({ base: 'min-w-[6ch] text-center' }),
};
