import { cva } from '../../utils/styles';

export const window = {
  root: cva({ base: 'relative flex flex-col' }),
  // The ink and the frame's rings, each a pixel further in
  ring: cva({ base: 'absolute' }),
  body: cva({
    base: [
      'relative flex min-h-0 flex-1 flex-col bg-(--bui-surface) leading-[1.35] text-(--bui-text)',
      'p-[calc(var(--bui-px)*4)]',
    ],
  }),
  legend: cva({
    base: 'mt-auto pt-[calc(var(--bui-px)*2)] text-right text-[0.75em] text-(--bui-dim)',
  }),
  key: cva({ base: 'text-(--bui-muted)' }),
  corner: cva({
    base: [
      'absolute right-[calc(var(--bui-px)*4)] bottom-[calc(var(--bui-px)*3)] text-right text-[0.75em] text-(--bui-dim)',
      'tall:inset-x-[calc(var(--bui-px)*4)] tall:bottom-[calc(var(--bui-bar)+var(--bui-px)*3)] tall:text-center',
    ],
  }),
};
