import { cva } from '../../utils/styles';

export const window = {
  // As wide as what is in it, never wider than its container: a box that
  // hugs its rows, as a game's menu does, not one that fills the stage.
  // The parent widens it where it should (a `Dialog`, a `Screen` held
  // upright). In a bounded column (a `Screen`) it may get less room than
  // it would take: `min-h-0` lets it, and its menu takes the cut by
  // scrolling
  root: cva({ base: 'relative flex min-h-0 w-fit max-w-full flex-col' }),
  // The ink and the frame's rings, each a pixel further in
  ring: cva({ base: 'absolute' }),
  body: cva({
    base: [
      'relative flex min-h-0 flex-1 flex-col bg-(--bui-surface) leading-[1.35] text-(--bui-text)',
      'p-window',
      // The parts by their slot: room under a title and above what can
      // be done; a legend along the bottom edge, right aligned, apart
      // from what is above it
      '[&>[data-slot=title]+*]:mt-regular',
      '*:data-[slot=actions]:mt-regular',
      '*:data-[slot=legend]:mt-auto *:data-[slot=legend]:pt-regular *:data-[slot=legend]:text-right',
    ],
  }),
  /** The legend's own look; where it sits is its parent's (a window's body, the stage) */
  legend: cva({ base: 'text-[0.75em] text-(--bui-dim)' }),
  key: cva({ base: 'text-(--bui-muted)' }),
};
