import { cva } from '../../utils/styles';

export const controls = {
  root: cva({
    variants: {
      layout: {
        /** The tall stage's bar along the bottom, `--bui-bar` tall */
        bar: [
          'absolute inset-x-0 bottom-0 z-30 flex h-(--bui-bar) items-center justify-between px-2',
          'border-t border-(--bui-frame-dim) bg-(--bui-ground)',
        ],
        /** The wide stage's corners: the groups place themselves on the stage */
        corner: 'contents',
      },
    },
  }),
  /** A group's buttons, side by side */
  group: cva({
    base: 'flex items-center',
    variants: {
      layout: {
        bar: '',
        corner: 'absolute top-[calc(var(--px)*5)] z-30',
      },
      side: { start: '', end: '' },
    },
    compoundVariants: [
      { layout: 'corner', side: 'start', class: 'left-[calc(var(--px)*5)]' },
      { layout: 'corner', side: 'end', class: 'right-[calc(var(--px)*5)]' },
      // At the bar's right the label comes first, the icon at the edge
      {
        layout: 'bar',
        side: 'end',
        class: 'ml-auto *:data-[slot=icon-button]:flex-row-reverse',
      },
    ],
  }),
};
