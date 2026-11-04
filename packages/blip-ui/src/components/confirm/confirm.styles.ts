import { cva } from '../../utils/styles';

export const confirm = {
  /** The stage dimmed, above the bar of controls */
  root: cva({
    base: 'absolute inset-x-0 top-0 bottom-(--bui-bar) z-10 flex items-center justify-center bg-(--bui-scrim)',
  }),
  window: cva({ base: 'w-[70%] tall:w-[90%]' }),
  body: cva({ base: 'grid gap-[calc(var(--bui-px)*3)]' }),
  picker: cva({ base: 'mt-[calc(var(--bui-px)*2)]' }),
};
