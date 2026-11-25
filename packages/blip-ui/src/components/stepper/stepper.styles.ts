import { cva } from '../../utils/styles';

/**
 * A value between its step arrows, the control of a `Field`. It takes the
 * control's whole cell, so a tap anywhere on the row reaches it. The
 * arrows are dim at rest and primary while it has the keys' focus, a
 * second cue to the `Field`'s cursor in the colours of a field's
 * underline (3.44:1 between them); the
 * value stays bright. Nothing moves: a value changes at once, as list
 * navigation does
 */
export const stepper = {
  root: cva({
    base: [
      // On the value's baseline, so it lines up with the label beside it
      'flex min-w-0 cursor-pointer items-baseline gap-related outline-none select-none',
      'text-(--bui-dim) focus-visible:text-(--bui-primary)',
      'touch:min-h-11',
      'aria-disabled:cursor-default aria-disabled:bui-disabled',
    ],
  }),
  /** A `Setting`'s arrows, centred on the line; at the start of the cell, not at the row's end as in a menu */
  step: cva({ base: 'self-center' }),
  /** As a `Setting`'s value: centred in six characters so the arrows stay put */
  value: cva({ base: 'w-[6ch] text-center text-(--bui-text-bright)' }),
};
