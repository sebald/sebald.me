import { cva } from '../../utils/styles';

/** The stage's parts */
export const stage = {
  root: cva({
    base: [
      // The native size at its scale, the ground's dark until a scene
      // lands; text is DOM, sized from the scale (so em units inside),
      // smooth and without a shadow
      'relative overflow-hidden outline-none',
      'bg-(--bui-ground) text-(--bui-text)',
      'select-none',
      // A game, not a page: no double-tap zoom, no tap flash, no
      // long-press menu on a face
      'touch-manipulation [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]',
    ],
  }),
  /** What shows instead of the stage on a phone held sideways */
  turned: cva({
    base: 'grid min-h-[60svh] place-content-center gap-2 bg-(--bui-ground) p-6 text-center text-sm text-(--bui-text)',
  }),
  /** The full stage inside the section; a lift settles smoothly */
  layer: cva({
    base: 'absolute inset-x-0 transition-[top,height] duration-300 ease-out motion-reduce:transition-none',
  }),
  center: cva({
    base: 'absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center',
  }),
};
