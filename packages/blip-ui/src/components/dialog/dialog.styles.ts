import { cva } from '../../utils/styles';

export const dialog = {
  /** The stage dimmed, above the bar of controls; the window in the middle */
  root: cva({
    base: 'absolute inset-x-0 top-0 bottom-(--bui-bar) z-10 flex items-center justify-center bg-(--bui-scrim) p-[calc(var(--bui-px)*6)]',
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
  /** The window's body places the parts, each by its slot */
  body: cva({
    base: [
      'gap-[calc(var(--bui-px)*3)]',
      '*:data-[slot=dialog-actions]:mt-[calc(var(--bui-px)*2)]',
      '*:data-[slot=legend]:pt-0',
    ],
  }),
  title: cva({ base: 'm-0 font-semibold text-(--bui-heading)' }),
  content: cva({ base: 'm-0' }),
  actions: cva({
    base: 'flex flex-wrap justify-center gap-[calc(var(--bui-px)*4)] *:data-[slot=picker]:basis-full',
  }),
};
