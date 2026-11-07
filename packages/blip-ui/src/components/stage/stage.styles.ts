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
    base: [
      'absolute inset-x-0 transition-[top,height] duration-300 ease-out motion-reduce:transition-none',
      // A legend on the stage itself: the bottom right corner; held
      // upright, centred over the bar of controls
      '*:data-[slot=legend]:absolute *:data-[slot=legend]:right-[calc(var(--bui-px)*4)] *:data-[slot=legend]:bottom-[calc(var(--bui-px)*3)] *:data-[slot=legend]:text-right',
      'tall:*:data-[slot=legend]:inset-x-[calc(var(--bui-px)*4)] tall:*:data-[slot=legend]:bottom-[calc(var(--bui-bar)+var(--bui-px)*3)] tall:*:data-[slot=legend]:text-center',
    ],
  }),
  center: cva({
    base: 'absolute inset-0 flex flex-col items-center justify-center gap-[calc(var(--bui-px)*4)] p-[calc(var(--bui-px)*8)] text-center',
  }),
};
