import { cva } from '../../utils/styles';

/**
 * The letters by role, so every screen says the same thing the same way.
 * Sizes are in em: the stage sizes its text from its scale.
 */
export const text = {
  heading: cva({ base: 'm-0 font-semibold text-(--bui-heading)' }),
  title: cva({
    base: 'absolute inset-x-0 m-0 grid justify-items-center gap-(--px) text-center',
  }),
  titleText: cva({
    base: 'm-0 text-[2em] font-semibold tracking-[0.1em] text-(--bui-primary) uppercase',
  }),
  muted: cva({ base: 'm-0 text-(--bui-muted)' }),
  loud: cva({
    base: [
      'font-semibold text-(--bui-primary)',
      'animate-bui-blink motion-reduce:animate-none',
    ],
  }),
};
