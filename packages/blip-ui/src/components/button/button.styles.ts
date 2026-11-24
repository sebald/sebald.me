import { type ClassValue, cva } from '../../utils/styles';
import type { ButtonProps } from './button';

/**
 * The button's parts: the ink line every sprite and window has, and the
 * key inside it. The variant sets the colours through `--b-*` variables,
 * so the parts' classes stay the same.
 *
 * A key is lit like the icons: a light row along its top, a shade row
 * along its bottom, the same thickness, so the label sits in the middle.
 * Pressed, the whole face goes a step darker with the shade along its
 * top, and nothing moves: a swap of the two rows alone was too small a
 * change for a click's tenth of a second and read as a blink.
 *
 * Focus is the menus' cursor, left of the button, the same on every
 * variant: a mark on the face would have to change with its colour. It
 * sits outside the box, so the button keeps its size: two pixels from the
 * ink, three from the face you see, as a menu's from its label. A row of
 * buttons leaves it room (`Actions`, `foundations/focus.mdx`).
 *
 * The pixel is `--bui-px`, the stage's never finer than `--bui-min-px`:
 * on a phone's tall stage a stage pixel is barely more than one CSS
 * pixel, and the ink, the steps and the bevel would thin to nothing.
 */
export const button = {
  root: cva({
    base: [
      '[--b-px:var(--bui-px)]',
      'group relative inline-block cursor-pointer border-0 bg-transparent p-0 align-middle outline-none',
      'disabled:cursor-default disabled:bui-disabled',
      // Pressed, a key goes a step darker with the shade along its top
      '[--b-rest:inset_0_var(--b-px)_0_var(--b-light),inset_0_calc(var(--b-px)*-1)_0_var(--b-shade)]',
      '[--b-face-down:color-mix(in_srgb,var(--b-face),var(--b-shade)_55%)] [--b-down:inset_0_var(--b-px)_0_var(--b-shade)]',
    ],
    variants: {
      variant: {
        /** The main action: a key in the primary colour */
        primary: [
          '[--b-face:var(--bui-primary)] [--b-light:var(--bui-primary-light)] [--b-shade:var(--bui-primary-shade)]',
          '[--b-text:var(--bui-primary-foreground)]',
        ],
        /** A quieter one beside it: a key a step lighter than the window, light letters */
        secondary: [
          '[--b-face:color-mix(in_srgb,var(--bui-surface-light),var(--bui-neutral)_22%)]',
          '[--b-light:color-mix(in_srgb,var(--bui-surface-light),var(--bui-neutral)_45%)] [--b-shade:var(--bui-surface-shade)]',
          '[--b-text:var(--bui-text-bright)]',
        ],
        /** What can't be undone: the key, in the danger colour */
        destructive: [
          '[--b-face:var(--bui-danger)] [--b-light:var(--bui-danger-light)] [--b-shade:var(--bui-danger-shade)]',
          '[--b-text:var(--bui-danger-foreground)]',
        ],
      } satisfies Record<NonNullable<ButtonProps['variant']>, ClassValue>,
      size: {
        /** A thumb's height, 44 CSS pixels at least */
        default:
          '[--b-height:--spacing(11)] [--b-inline:calc(var(--bui-px)*6)] text-[1em]',
        /** Dense menus where a pointer aims */
        small:
          '[--b-height:--spacing(8)] [--b-inline:calc(var(--bui-px)*4)] text-[0.85em]',
      } satisfies Record<NonNullable<ButtonProps['size']>, ClassValue>,
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }),
  /** The cursor: a stepped triangle as a Picker's, 3 seen pixels from the face */
  cursor: cva({
    base: [
      'pointer-events-none absolute top-1/2 right-[calc(100%+var(--b-px)*2)] -translate-y-1/2',
      'h-[calc(var(--b-px)*5)] w-[calc(var(--b-px)*3)] text-(--bui-primary) bui-point-right',
      'opacity-0 group-focus-visible:opacity-100',
    ],
  }),
  /** The ink line round the key */
  ink: cva({ base: 'block bg-(--bui-ink) p-(--b-px)' }),
  face: cva({
    base: [
      'min-h-(--b-height) px-(--b-inline)',
      'flex items-center justify-center',
      'bg-(--b-face) text-(--b-text) shadow-(--b-rest)',
      'group-enabled:group-hover:brightness-110 group-enabled:group-active:brightness-100',
      'group-enabled:group-active:bg-(--b-face-down) group-enabled:group-active:shadow-(--b-down)',
      'font-semibold tracking-[0.12em] uppercase',
    ],
  }),
};
