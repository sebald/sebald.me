import { cva } from '../../utils/styles';

export const window = {
  root: cva({ base: 'relative flex flex-col' }),
  // The ink and the frame's rings, each a pixel further in
  ring: cva({ base: 'absolute' }),
  body: cva({
    base: [
      'relative flex min-h-0 flex-1 flex-col bg-(--bui-surface) leading-[1.35] text-(--bui-text)',
      'p-[calc(var(--bui-px)*4)]',
      // The parts by their slot: room under a title and above what can
      // be done; a legend along the bottom edge, right aligned, apart
      // from what is above it
      '[&>[data-slot=title]+*]:mt-[calc(var(--bui-px)*3)]',
      '*:data-[slot=actions]:mt-[calc(var(--bui-px)*4)]',
      '*:data-[slot=legend]:mt-auto *:data-[slot=legend]:pt-[calc(var(--bui-px)*4)] *:data-[slot=legend]:text-right',
    ],
  }),
  /** The legend's own look; where it sits is its parent's (a window's body, the stage) */
  legend: cva({ base: 'text-[0.75em] text-(--bui-dim)' }),
  key: cva({ base: 'text-(--bui-muted)' }),
};
