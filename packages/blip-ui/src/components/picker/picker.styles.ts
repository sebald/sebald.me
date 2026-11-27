import { type ClassValue, cva } from '../../utils/styles';
import type { PickerItemProps, PickerItemValueProps } from './picker';

/** The picker's parts, and the rail and description box beside it */
export const picker = {
  root: cva({ base: 'flex min-h-0' }),
  menu: cva({
    base: [
      'grid min-h-0 flex-1 content-start gap-joined overflow-y-auto',
      // The native scrollbar is off: the pixel one beside it shows the rest
      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      // A group after other items: room above it
      '*:data-[slot=picker-group]:not-first:mt-regular',
    ],
    variants: {
      /**
       * In columns: the cursor's, the name's, then one per value
       * (`--picker-values` of them), each as wide as its widest value.
       * Every row and group takes the list's columns as its own, so a
       * value lines up with its column's other values and its header
       */
      columned: {
        true: [
          'grid-cols-[auto_minmax(0,1fr)_repeat(var(--picker-values),auto)]',
          // No gap between columns at any depth: a subgrid with a gap of
          // its own would shift its cells off the header's
          'gap-x-0',
          '*:col-span-full *:grid *:grid-cols-subgrid',
        ],
      },
    },
  }),
  /** A group's items, spaced as the menu's */
  group: cva({
    base: 'grid gap-joined',
    variants: {
      columned: {
        true: 'col-span-full grid-cols-subgrid gap-x-0 *:col-span-full *:grid *:grid-cols-subgrid',
      },
    },
  }),
  /** A setting's row: its name, the value at the end */
  setting: cva({
    base: [
      'flex w-full items-center gap-regular',
      // The value reaches into the row's right room, so it ends where
      // every value in a window ends; the row keeps its room, which a
      // neighbour's cursor needs
      '*:data-[slot=setting]:-mr-control',
    ],
  }),
  item: cva({
    base: [
      'group flex w-full items-center gap-cursor px-control py-joined text-left',
      // With a detail under its name, the cursor stays on the name's line
      'has-[[data-slot=picker-item-detail]]:items-start has-[[data-slot=picker-item-detail]]:*:data-[slot=cursor]:mt-[calc((1lh-var(--bui-px)*5)/2)]',
      // The cursor's row lit at once: moved by the arrows, list
      // navigation doesn't animate
      'cursor-pointer',
      // Focus is the cursor, in the primary colour, on this row (`cursor`)
      'outline-none',
      'aria-disabled:cursor-default',
      // Held upright, a row is a thumb's height
      'tall:min-h-11',
      // A setting's arrows bright, whatever the row's colour: never a
      // second yellow beside the cursor, whatever a game makes it
      '[&_[data-slot=step]]:text-(--bui-text-bright)',
    ],
    variants: {
      selected: {
        true: 'text-(--bui-text-selected)',
        false: 'text-(--bui-text-bright) hover:text-(--bui-text-selected)',
      },
      /**
       * Whether a setting's arrows show: on the cursor's row, where Left
       * and Right work, and on every row under a finger (the picker's own
       * input kind, so a touch on a laptop counts), the sign a tap steps it
       */
      stepsShown: {
        true: '',
        false: '[&_[data-slot=step]]:opacity-0',
      },
      variant: {
        default: '',
        /** The loud one */
        accent: 'text-(--bui-primary) hover:text-(--bui-primary-light)',
        /** It leaves: looks like any item, sounds like stepping back */
        back: '',
      } satisfies Record<NonNullable<PickerItemProps['variant']>, ClassValue>,
    },
    compoundVariants: [
      {
        selected: true,
        variant: 'accent',
        className: 'text-(--bui-primary-light)',
      },
    ],
    defaultVariants: { selected: false, stepsShown: true, variant: 'default' },
  }),
  /**
   * A row in columns: the cursor in the first, its text across the rest.
   * No gaps in the columns: the cursor's room is its margin, a value's its
   * padding, so each counts in its column's width the same in every row
   */
  itemColumned: cva({
    base: [
      'col-span-full grid grid-cols-subgrid gap-0',
      '*:data-[slot=cursor]:mr-cursor *:data-cursor-target:col-[2/-1]',
    ],
  }),
  /** The cursor: a stepped pixel triangle, in `--bui-px` like every control */
  cursor: cva({
    base: 'text-(--bui-primary) h-[calc(var(--bui-px)*5)] w-[calc(var(--bui-px)*3)] shrink-0 bui-point-right',
    variants: { shown: { true: 'opacity-100', false: 'opacity-0' } },
  }),
  label: cva({
    // Dimmed or lit by a change of state, a short fade; its parts with it.
    // A word longer than the window breaks, so no row widens the list
    base: 'min-w-0 flex-1 wrap-anywhere transition-opacity duration-200 ease-bui-out',
    variants: { disabled: { true: 'bui-disabled' } },
  }),
  /**
   * What holds an item's text, the label or an accent item's blinking
   * call: holding parts, a block of text. A tag follows the name's last
   * word, the value floats to the end of that line, the detail is a line
   * of its own under them. Without parts it stays plain text
   */
  parts: cva({
    base: [
      'has-[>[data-slot^=picker-item-],>[data-slot=tag]]:flow-root',
      '*:data-[slot=tag]:ml-related',
      '*:data-[slot=picker-item-value]:float-right *:data-[slot=picker-item-value]:pl-regular',
      // The value ends where a setting's does, every value in a window
      '*:data-[slot=picker-item-value]:-mr-control',
      '*:data-[slot=picker-item-detail]:block *:data-[slot=picker-item-detail]:clear-both',
    ],
  }),
  /**
   * An item's text in columns, the label or an accent item's call: the
   * name (and its tag) in the name's column, each value in its own, a
   * detail a line of its own under them all
   */
  columns: cva({
    base: [
      'grid grid-cols-subgrid items-baseline',
      '*:data-[slot=picker-item-value]:pl-regular *:data-[slot=picker-item-value]:text-right',
      // The last value ends where a setting's does, every value in a window
      '[&>[data-slot=picker-item-value]:not(:has(~[data-slot=picker-item-value]))]:-mr-control',
      '*:data-[slot=picker-item-detail]:col-span-full',
    ],
  }),
  /** The name's column: the name, a tag after its last word */
  name: cva({
    base: 'min-w-0 *:data-[slot=tag]:ml-related',
    variants: {
      /** A row with no values (Back, a setting): its name across them all */
      alone: { true: 'col-span-full' },
    },
  }),
  /**
   * The columns' names over the list, quieter than the rows, each over its
   * column: the name's left, a value's right, as its values are
   */
  header: cva({
    base: [
      'items-baseline px-control pb-joined text-[0.85em] text-(--bui-muted)',
      '*:not-first:not-nth-2:pl-regular *:not-first:not-nth-2:text-right',
      '*:last:not-nth-2:-mr-control',
    ],
  }),
  /** A second line: quieter and smaller, never the loud one's weight */
  detail: cva({ base: 'text-[0.85em] font-normal text-(--bui-muted)' }),
  /** A value at the row's end: its figures keep their width */
  value: cva({
    base: 'tabular-nums',
    variants: {
      variant: {
        default: '',
        // Only the colour, never a smaller size: the value floats, and a
        // float of other letters need not share the name's baseline
        progress: 'text-(--bui-muted)',
      } satisfies Record<
        NonNullable<PickerItemValueProps['variant']>,
        ClassValue
      >,
    },
    defaultVariants: { variant: 'default' },
  }),
  /** The rail beside a list that does not fit: an arrow, a track, an arrow */
  rail: cva({
    base: 'ml-related flex w-[calc(var(--bui-px)*5)] shrink-0 flex-col items-center',
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
    base: 'relative my-joined w-(--bui-px) flex-1 bg-(--bui-empty-dots)',
  }),
  thumb: cva({ base: 'absolute inset-x-0 bg-(--bui-neutral)' }),
  /** The description box beside the menu's window */
  note: cva({
    base: 'pointer-events-none absolute z-(--bui-layer-note) text-[0.85em] leading-[1.35] text-balance',
  }),
};
