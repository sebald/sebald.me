import { cva } from '../../utils/styles';

/**
 * The button's parts. Inside the ink line every sprite and window has:
 * the ring (the key's side, or the outline's frame), and the face. The
 * variant sets the colours and the cut through `--b-*` variables, so the
 * parts' classes stay the same.
 *
 * The pixel is the stage's, never finer than `--dui-min-px`: on a
 * phone's tall stage a stage pixel is barely more than one CSS pixel, and
 * the ink, the steps and the side would thin to nothing.
 */
export const button = {
  root: cva({
    base: [
      '[--b-px:max(var(--px,3px),var(--dui-min-px,3px))]',
      'group inline-block cursor-pointer bg-(--dui-ink) p-(--b-px) align-middle outline-none',
      'focus-visible:dui-focus',
      'disabled:cursor-default disabled:opacity-50 disabled:saturate-0',
    ],
    variants: {
      variant: {
        /** The main action: a key on its side, sinking onto it pressed */
        primary: [
          '[--b-face:var(--dui-primary)] [--b-light:var(--dui-primary-light)]',
          '[--b-ring:var(--dui-primary-shade)] [--b-ring-down:var(--dui-ink)]',
          '[--b-text:var(--dui-primary-foreground)] [--b-text-down:var(--dui-primary-foreground)]',
          '[--b-pad:0px] [--b-lip:calc(var(--b-px)*2)]',
          '[--b-rest:inset_0_var(--b-px)_0_var(--b-light)] [--b-down:var(--b-rest)]',
        ],
        /** A quieter one beside it: a frame, filled while pressed */
        secondary: [
          '[--b-face:var(--dui-ground)] [--b-ring:var(--dui-neutral)] [--b-ring-down:var(--dui-neutral)]',
          '[--b-text:var(--dui-neutral)] [--b-text-down:var(--dui-neutral-foreground)]',
          '[--b-pad:var(--b-px)] [--b-lip:0px]',
          '[--b-rest:none] [--b-down:inset_0_0_0_999px_var(--dui-neutral)]',
        ],
        /** What can't be undone: the key, in the danger colour */
        destructive: [
          '[--b-face:var(--dui-danger)] [--b-light:var(--dui-danger-light)]',
          '[--b-ring:var(--dui-danger-shade)] [--b-ring-down:var(--dui-ink)]',
          '[--b-text:var(--dui-danger-foreground)] [--b-text-down:var(--dui-danger-foreground)]',
          '[--b-pad:0px] [--b-lip:calc(var(--b-px)*2)]',
          '[--b-rest:inset_0_var(--b-px)_0_var(--b-light)] [--b-down:var(--b-rest)]',
        ],
      },
      size: {
        /** A thumb's height, 44 CSS pixels at least */
        default:
          '[--b-height:--spacing(11)] [--b-inline:--spacing(5)] text-[1em]',
        /** Dense menus where a pointer aims */
        small:
          '[--b-height:--spacing(8)] [--b-inline:--spacing(3)] text-[0.85em]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }),
  // Pressed, the lip moves above the face: it sinks by its depth
  ring: cva({
    base: [
      'block bg-(--b-ring) p-(--b-pad) pb-[calc(var(--b-pad)+var(--b-lip))]',
      'group-enabled:group-active:bg-(--b-ring-down) group-enabled:group-active:pt-[calc(var(--b-pad)+var(--b-lip))] group-enabled:group-active:pb-(--b-pad)',
    ],
  }),
  face: cva({
    base: [
      'flex min-h-(--b-height) items-center justify-center px-(--b-inline)',
      'bg-(--b-face) text-(--b-text) shadow-(--b-rest)',
      'group-enabled:group-hover:brightness-110',
      'group-enabled:group-active:bg-(--b-face-down,var(--b-face)) group-enabled:group-active:text-(--b-text-down) group-enabled:group-active:shadow-(--b-down)',
      'font-semibold tracking-[0.12em] uppercase',
    ],
  }),
};
