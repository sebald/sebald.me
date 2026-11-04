import { cva } from '../../utils/styles';

export const window = {
  root: cva({ base: 'relative flex flex-col' }),
  // The ink and the frame's rings, each a pixel further in
  ring: cva({ base: 'absolute' }),
  body: cva({
    base: [
      'relative flex min-h-0 flex-1 flex-col bg-(--bui-surface) leading-[1.35] text-(--bui-text)',
      // The padding has a CSS-pixel floor: on a phone's tall stage the
      // stage pixel is too fine to keep text off the frame
      'p-[calc(var(--px)*3+4px)] tall:p-[calc(var(--px)*3+7px)]',
    ],
  }),
  legend: cva({
    base: 'mt-auto pt-[calc(var(--px)*2)] text-right text-[0.75em] text-(--bui-dim)',
  }),
  key: cva({ base: 'text-(--bui-muted)' }),
  corner: cva({
    base: [
      'absolute right-3 bottom-2 text-right text-[0.75em] text-(--bui-dim)',
      'tall:inset-x-3 tall:bottom-[calc(var(--bui-bar)+var(--px)*3)] tall:text-center',
    ],
  }),
};
