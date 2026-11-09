import { cva } from '../../utils/styles';

export const setting = {
  root: cva({
    base: 'ml-auto flex items-center gap-[calc(var(--bui-px)*2)]',
  }),
  /** Left or right of the value: a pixel triangle, dim at the end it cannot go past */
  step: cva({
    base: 'inline-block h-[calc(var(--bui-px)*5)] w-[calc(var(--bui-px)*3)] bg-current',
    variants: {
      points: {
        left: '[clip-path:polygon(100%_0,0_50%,100%_100%)]',
        right: '[clip-path:polygon(0_0,100%_50%,0_100%)]',
      },
      more: { true: '', false: 'bui-disabled' },
    },
  }),
  value: cva({ base: 'w-[6ch] text-center' }),
};
