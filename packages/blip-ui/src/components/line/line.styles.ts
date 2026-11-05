import { cva } from '../../utils/styles';

export const line = {
  line: cva({
    base: 'm-0 flex items-start gap-[calc(var(--bui-px)*3)]',
    variants: { past: { true: 'text-(--bui-muted)' } },
  }),
  mark: cva({
    base: 'mt-[0.4em] inline-block size-[0.55em] shrink-0',
    variants: {
      /** Whose mark: the gold of the side the screen is about, the ember of the other */
      variant: {
        primary: 'bg-(--bui-primary)',
        secondary: 'bg-(--bui-secondary)',
      },
    },
    defaultVariants: { variant: 'primary' },
  }),
};
