import { cva } from '../../utils/styles';

export const dialogue = {
  line: cva({
    base: 'm-0 flex items-start gap-[calc(var(--bui-px)*3)]',
    variants: { muted: { true: 'text-(--bui-muted)' } },
  }),
  mark: cva({
    base: 'mt-[0.4em] inline-block size-[0.55em] shrink-0',
    variants: {
      /** Whose mark: the player's gold or the opponent's ember */
      tone: {
        primary: 'bg-(--bui-primary)',
        secondary: 'bg-(--bui-secondary)',
      },
    },
    defaultVariants: { tone: 'primary' },
  }),
};
