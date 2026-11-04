import { cva } from '../../utils/styles';

export const tabs = {
  root: cva({ base: 'flex min-h-0 flex-col' }),
  list: cva({
    base: 'mb-[calc(var(--px)*2)] flex justify-center gap-[calc(var(--px)*4)]',
  }),
  tab: cva({
    base: [
      'cursor-pointer border-b-[length:var(--px)] px-[calc(var(--px)*2)] pb-(--px) outline-none',
      'focus-visible:bui-focus',
      'border-transparent text-(--bui-muted) hover:text-(--bui-text-bright)',
      // The active tab: the underline and the text in the primary colour
      'data-[active]:border-(--bui-primary) data-[active]:text-(--bui-primary)',
      'data-[disabled]:cursor-default data-[disabled]:opacity-40',
    ],
  }),
  panel: cva({ base: 'min-h-0 flex-1 outline-none focus-visible:bui-focus' }),
};
