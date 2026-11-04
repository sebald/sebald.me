import { cva } from '../../utils/styles';

export const setting = {
  root: cva({
    base: 'ml-auto flex items-center gap-[calc(var(--px)*2)]',
  }),
  /** Left or right of the value: a pixel triangle, dim at the end it cannot go past */
  step: cva({
    base: 'inline-block h-[calc(var(--px)*5)] w-[calc(var(--px)*3)] bg-current',
    variants: {
      left: {
        true: '[clip-path:polygon(100%_0,0_50%,100%_100%)]',
        false: '[clip-path:polygon(0_0,100%_50%,0_100%)]',
      },
      more: { true: 'opacity-100', false: 'opacity-25' },
    },
  }),
  value: cva({ base: 'w-[6ch] text-center' }),
};
