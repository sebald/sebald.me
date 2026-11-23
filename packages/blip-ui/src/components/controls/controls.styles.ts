import { cva } from '../../utils/styles';

export const controls = {
  root: cva({
    base: [
      // Placed by the slot they fill: what leaves first, then a gap that
      // takes the room, then the switches (a button without a slot is one)
      "flex items-center before:order-0 before:flex-1 before:content-['']",
      '[&>*]:order-1 [&>[slot=leave]]:order-first',
    ],
    variants: {
      layout: {
        /** The tall stage's bar along the bottom, `--bui-bar` tall */
        bar: [
          'absolute inset-x-0 bottom-0 z-(--bui-layer-controls) h-(--bui-bar) px-2',
          'border-t border-(--bui-frame-dim) bg-(--bui-ground)',
          // At the bar's right the label comes first, the icon at the edge
          '[&>:not([slot=leave])]:flex-row-reverse',
        ],
        /** Along the wide stage's top, the buttons in its corners; the row between lets taps through */
        corner: [
          'pointer-events-none absolute inset-x-[calc(var(--px)*5)] top-[calc(var(--px)*5)] z-(--bui-layer-controls)',
          // Room for a focused button's cursor, two pixels left of its box:
          // between two buttons, and at the stage's left edge
          'left-[max(calc(var(--px)*5),calc(var(--bui-px)*2))] [&>*+*]:ml-[calc(var(--bui-px)*2)]',
          '[&>*]:pointer-events-auto',
        ],
      },
    },
  }),
};
