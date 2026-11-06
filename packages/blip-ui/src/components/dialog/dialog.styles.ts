import { cva } from '../../utils/styles';

export const dialog = {
  /** The stage dimmed down to the bar of controls, and over the controls (z-40 to their z-30), which a tap only closes it from; the window in the middle */
  root: cva({
    base: 'absolute inset-x-0 top-0 bottom-(--bui-bar) z-40 flex items-center justify-center bg-(--bui-scrim) p-[calc(var(--bui-px)*6)]',
  }),
  popup: cva({
    base: 'outline-none',
    variants: {
      size: {
        /** A question, a few settings */
        default: 'w-[70%] tall:w-[90%]',
        /** A lot to read: as wide as the stage lets it */
        large: 'w-full',
      },
    },
    defaultVariants: { size: 'default' },
  }),
  /** What can be done, centred under what it says */
  body: cva({ base: '*:data-[slot=actions]:justify-center' }),
};
