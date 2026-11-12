import { cva } from '../../utils/styles';

/** The picker's parts, and the rail and description box beside it */
export const picker = {
  root: cva({ base: 'flex min-h-0' }),
  menu: cva({
    base: [
      'grid min-h-0 flex-1 content-start gap-(--bui-px) overflow-y-auto',
      // The native scrollbar is off: the pixel one beside it shows the rest
      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      // A group after other items: room above it
      '*:data-[slot=picker-group]:not-first:mt-[calc(var(--bui-px)*4)]',
    ],
  }),
  /** A group's items, spaced as the menu's */
  group: cva({ base: 'grid gap-(--bui-px)' }),
  /** A setting's row: its name, the value at the end */
  setting: cva({
    base: 'flex w-full items-center gap-[calc(var(--bui-px)*4)]',
  }),
  item: cva({
    base: [
      'flex w-full items-center gap-[calc(var(--bui-px)*3)] px-[calc(var(--bui-px)*2)] py-(--bui-px) text-left',
      // The cursor's row lit at once: moved by the arrows, list
      // navigation doesn't animate
      'cursor-pointer',
      'outline-none focus-visible:bui-focus',
      'aria-disabled:cursor-default',
      // Held upright, a row is a thumb's height
      'tall:min-h-11',
    ],
    variants: {
      selected: {
        true: 'text-(--bui-text-selected)',
        false: 'text-(--bui-text-bright) hover:text-(--bui-text-selected)',
      },
      variant: {
        default: '',
        /** The loud one */
        accent: 'text-(--bui-primary) hover:text-(--bui-primary-light)',
        /** It leaves: looks like any item, sounds like stepping back */
        back: '',
      },
    },
    compoundVariants: [
      {
        selected: true,
        variant: 'accent',
        className: 'text-(--bui-primary-light)',
      },
    ],
    defaultVariants: { selected: false, variant: 'default' },
  }),
  /** The cursor: a stepped pixel triangle, in `--bui-px` like every control */
  cursor: cva({
    base: 'h-[calc(var(--bui-px)*5)] w-[calc(var(--bui-px)*3)] shrink-0 bui-point-right',
    variants: { shown: { true: 'opacity-100', false: 'opacity-0' } },
  }),
  label: cva({
    // Dimmed or lit by a change of state, a short fade
    base: 'min-w-0 flex-1 transition-opacity duration-200 ease-bui-out',
    variants: { disabled: { true: 'bui-disabled' } },
  }),
  /** The rail beside a list that does not fit: an arrow, a track, an arrow */
  rail: cva({
    base: 'ml-[calc(var(--bui-px)*2)] flex w-[calc(var(--bui-px)*5)] shrink-0 flex-col items-center',
  }),
  arrow: cva({
    base: 'h-[calc(var(--bui-px)*3)] w-[calc(var(--bui-px)*5)] shrink-0',
    variants: {
      up: {
        true: 'bui-point-up',
        false: 'bui-point-down',
      },
      more: {
        true: 'text-(--bui-text)',
        false: 'text-(--bui-empty-dots)',
      },
    },
  }),
  track: cva({
    base: 'relative my-(--bui-px) w-(--bui-px) flex-1 bg-(--bui-empty-dots)',
  }),
  thumb: cva({ base: 'absolute inset-x-0 bg-(--bui-neutral)' }),
  /** The description box beside the menu's window */
  note: cva({
    base: 'pointer-events-none absolute z-(--bui-layer-note) text-[0.85em] leading-[1.35] text-balance',
  }),
};
