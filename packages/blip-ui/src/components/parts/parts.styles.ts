import { cva } from '../../utils/styles';

/** The parts' own look; where they sit is the container's */
export const parts = {
  title: cva({ base: 'm-0 font-semibold text-(--bui-heading)' }),
  content: cva({ base: 'm-0' }),
  actions: cva({
    base: 'flex flex-wrap items-center gap-[calc(var(--bui-px)*4)] *:data-[slot=picker]:basis-full',
  }),
};
