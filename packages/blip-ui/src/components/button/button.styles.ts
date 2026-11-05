import { cva } from '../../utils/styles';

/**
 * The button's parts. Inside the ink line every sprite and window has:
 * the ring (the outline's frame), and the face. The variant sets the
 * colours and the cut through `--b-*` variables, so the parts' classes
 * stay the same.
 *
 * A key is lit like the icons: a light row along its top, a shade row
 * along its bottom, the same thickness, so the label sits in the middle.
 * Pressed, the whole face goes a step darker with the shade along its
 * top, and nothing moves: a swap of the two rows alone was too small a
 * change for a click's tenth of a second and read as a blink.
 *
 * The pixel is `--bui-px`, the stage's never finer than `--bui-min-px`:
 * on a phone's tall stage a stage pixel is barely more than one CSS
 * pixel, and the ink, the steps and the bevel would thin to nothing.
 */
export const button = {
  root: cva({
    base: [
      '[--b-px:var(--bui-px)]',
      'group inline-block cursor-pointer bg-(--bui-ink) p-(--b-px) align-middle outline-none',
      'focus-visible:bui-focus',
      'disabled:cursor-default disabled:bui-disabled',
    ],
    variants: {
      variant: {
        /** The main action: a key, lit from above, pressed in */
        primary: [
          '[--b-face:var(--bui-primary)] [--b-light:var(--bui-primary-light)] [--b-shade:var(--bui-primary-shade)]',
          '[--b-text:var(--bui-primary-foreground)] [--b-text-down:var(--bui-primary-foreground)]',
          '[--b-pad:0px]',
          '[--b-rest:inset_0_var(--b-px)_0_var(--b-light),inset_0_calc(var(--b-px)*-1)_0_var(--b-shade)]',
          '[--b-face-down:color-mix(in_srgb,var(--b-face),var(--b-shade)_55%)] [--b-down:inset_0_var(--b-px)_0_var(--b-shade)]',
        ],
        /** A quieter one beside it: a frame, filled while pressed */
        secondary: [
          '[--b-face:var(--bui-ground)] [--b-ring:var(--bui-neutral)]',
          '[--b-text:var(--bui-neutral)] [--b-text-down:var(--bui-neutral-foreground)]',
          '[--b-pad:var(--b-px)]',
          '[--b-rest:none] [--b-down:inset_0_0_0_999px_var(--bui-neutral)]',
        ],
        /** What can't be undone: the key, in the danger colour */
        destructive: [
          '[--b-face:var(--bui-danger)] [--b-light:var(--bui-danger-light)] [--b-shade:var(--bui-danger-shade)]',
          '[--b-text:var(--bui-danger-foreground)] [--b-text-down:var(--bui-danger-foreground)]',
          '[--b-pad:0px]',
          '[--b-rest:inset_0_var(--b-px)_0_var(--b-light),inset_0_calc(var(--b-px)*-1)_0_var(--b-shade)]',
          '[--b-face-down:color-mix(in_srgb,var(--b-face),var(--b-shade)_55%)] [--b-down:inset_0_var(--b-px)_0_var(--b-shade)]',
        ],
      },
      size: {
        /** A thumb's height, 44 CSS pixels at least */
        default:
          '[--b-height:--spacing(11)] [--b-inline:calc(var(--bui-px)*6)] text-[1em]',
        /** Dense menus where a pointer aims */
        small:
          '[--b-height:--spacing(8)] [--b-inline:calc(var(--bui-px)*4)] text-[0.85em]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }),
  // The outline's frame; a key has none (no padding, the face fills it)
  ring: cva({ base: 'block bg-(--b-ring,transparent) p-(--b-pad)' }),
  face: cva({
    base: [
      // Less the ring, so the outline and the key come out one size
      '[--b-x:calc(var(--b-inline)-var(--b-pad))] min-h-[calc(var(--b-height)-var(--b-pad)*2)] px-(--b-x)',
      'flex items-center justify-center',
      'bg-(--b-face) text-(--b-text) shadow-(--b-rest)',
      'group-enabled:group-hover:brightness-110 group-enabled:group-active:brightness-100',
      'group-enabled:group-active:bg-(--b-face-down,var(--b-face)) group-enabled:group-active:text-(--b-text-down) group-enabled:group-active:shadow-(--b-down)',
      'font-semibold tracking-[0.12em] uppercase',
    ],
  }),
};
