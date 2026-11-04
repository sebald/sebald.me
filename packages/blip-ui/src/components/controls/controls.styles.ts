import { cva } from '../../utils/styles';

export const controls = {
  /** The tall stage's bar along the bottom, `--bui-bar` tall */
  bar: cva({
    base: [
      'absolute inset-x-0 bottom-0 z-30 flex h-(--bui-bar) items-center justify-between px-2',
      'border-t border-(--bui-frame-dim) bg-(--bui-ground)',
    ],
  }),
  /** A slot's buttons, side by side */
  slot: cva({ base: 'flex items-center' }),
  /** A slot in a corner of the wide stage */
  corner: cva({ base: 'absolute z-30 flex items-center' }),
};
