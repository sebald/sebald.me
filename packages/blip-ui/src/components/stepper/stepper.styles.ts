import { cva } from '../../utils/styles';

/**
 * A value between its step arrows, the control of a `Field`. It takes the
 * control's whole cell, so a tap anywhere on the row reaches it. The
 * arrows show only where Left and Right work: while it has the keys'
 * focus (in the primary colour, beside the `Field`'s cursor) or the
 * pointer, so a window of steppers reads as names and values, not a
 * column of arrows. Their room is kept, so nothing shifts. Under a
 * finger there is no cursor: the arrows stay, dim, as the sign that a
 * tap steps it. The value stays bright. Nothing moves: a value changes
 * at once, as list navigation does
 */
export const stepper = {
  root: cva({
    base: [
      // On the value's baseline, so it lines up with the label beside it
      'group/stepper flex min-w-0 cursor-pointer items-baseline justify-end gap-related outline-none select-none',
      'text-(--bui-dim) focus-visible:text-(--bui-primary)',
      // A thumb's target (44 CSS pixels and more) that reaches into the
      // gaps around the row instead of making it taller: a taller row
      // would push its value and arrows apart and its words away from it
      "relative touch:before:absolute touch:before:inset-x-0 touch:before:-inset-y-regular touch:before:content-['']",
      // Disabled, it ignores the pointer too: no arrows on hover
      'aria-disabled:pointer-events-none aria-disabled:bui-disabled',
    ],
  }),
  /** A `Setting`'s arrows, centred on the line, either side of the value at the row's end. Hidden at rest where there is a pointer */
  step: cva({
    base: [
      'self-center',
      '[@media(hover:hover),(pointer:fine)]:opacity-0',
      'group-hover/stepper:opacity-100 group-focus-visible/stepper:opacity-100',
    ],
  }),
  /**
   * As a `Setting`'s value: centred in six characters, so the arrows stay
   * put as it changes, and with them at the row's end, where every value
   * in a window ends. The stepper itself still takes the whole column, so
   * a tap anywhere on the row reaches it
   */
  value: cva({ base: 'min-w-[6ch] text-center text-(--bui-text-bright)' }),
};
