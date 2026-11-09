import { cva } from '../../utils/styles';

/**
 * The letters by role, so every screen says the same thing the same way.
 * Sizes are in em: the stage sizes its text from its scale.
 */
export const text = {
  heading: cva({ base: 'm-0 font-semibold text-(--bui-heading)' }),
  title: cva({
    base: 'absolute inset-x-0 m-0 grid justify-items-center gap-[calc(var(--bui-px)*2)] text-center',
  }),
  // The heading under the bitmap letters, for assistive technology
  titleText: cva({ base: 'sr-only' }),
  text: cva({
    base: 'm-0',
    variants: {
      variant: {
        /** A quieter paragraph: a prompt, a blurb, a hint */
        hint: 'text-(--bui-muted)',
        /** The call to act, blinking */
        call: [
          'font-semibold text-(--bui-primary)',
          'animate-bui-blink motion-reduce:animate-none',
        ],
      },
    },
    defaultVariants: { variant: 'hint' },
  }),
};
