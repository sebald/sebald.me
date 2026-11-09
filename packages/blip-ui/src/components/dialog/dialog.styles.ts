import { cva } from '../../utils/styles';

export const dialog = {
  /** The stage dimmed down to the bar of controls, and over the controls (`--bui-layer-dialog` to their `--bui-layer-controls`), which a tap only closes it from; the window in the middle */
  root: cva({
    base: 'absolute inset-x-0 top-0 bottom-(--bui-bar) z-(--bui-layer-dialog) flex items-center justify-center bg-(--bui-scrim) p-[calc(var(--bui-px)*6)]',
  }),
  popup: cva({
    // What can be done, centred under what it says
    base: 'outline-none [&>[data-slot=window]>[data-slot=window-body]>[data-slot=actions]]:justify-center',
    variants: {
      size: {
        /** A question, a few settings */
        /** Held upright, all of the stage inside its margin */
        default: 'w-[70%] tall:w-full',
        /** A lot to read: as wide as the stage lets it */
        large: 'w-full',
      },
    },
    defaultVariants: { size: 'default' },
  }),
};
