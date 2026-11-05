'use client';

import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useContext,
} from 'react';

import { ControlsLayout } from '../controls/controls';
import { type IconName } from '../pixel-icon/icons';
import { PixelIcon } from '../pixel-icon/pixel-icon';
import { iconButton } from './icon-button.styles';

/** CSS pixels per icon pixel on the bar, where a thumb sets the size */
const BAR_DOT = 1.5;

// A tap on a control is not a tap that opens a menu, moves a duel on or
// leaves a demo: it stays with the control
const keep = (event: PointerEvent) => event.stopPropagation();

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'slot'
> {
  /**
   * What it is, for `Controls` to place it: `leave` (Back, Pause) goes to
   * the start, `system` (the sound, fullscreen) to the end
   * @default 'system'
   */
  slot?: 'leave' | 'system';
  /** What the button does, for assistive technology (and a hint of its key) */
  'aria-label': string;
  /** Which icon, by name */
  icon: IconName;
  /**
   * Text beside the icon on the tall stage's bar; in a corner the icon
   * stands alone and the `aria-label` names it
   */
  label?: ReactNode;
}

/**
 * A round of the controls: an icon in a button at least 44 CSS pixels to
 * touch. A tap stays with it (`pointerdown` and `click` do not bubble).
 * Its look follows where it is: in the tall stage's bar it shows its
 * label and a bigger icon, in a corner (or on its own) the icon alone.
 * Put it in `Controls`, with the `slot` it fills.
 */
export const IconButton = ({
  icon,
  label,
  slot = 'system',
  className,
  onClick,
  children,
  ...props
}: IconButtonProps) => {
  const layout = useContext(ControlsLayout);
  const bar = layout === 'bar';
  return (
    <button
      type="button"
      data-slot="icon-button"
      slot={slot}
      className={iconButton({ layout, className })}
      onPointerDown={keep}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      {...props}
    >
      <PixelIcon icon={icon} dot={bar ? BAR_DOT : undefined} />
      {bar && label}
      {children}
    </button>
  );
};

export interface IconToggleProps extends Omit<
  IconButtonProps,
  'icon' | 'onClick'
> {
  /** Whether it is on; the state lives with the caller */
  pressed: boolean;
  /** The icon while off, and while on unless `pressedIcon` is set */
  icon: IconName;
  /** The icon while on (sound on, exit fullscreen) */
  pressedIcon?: IconName;
  /** The label beside the icon while on, if it differs */
  pressedLabel?: ReactNode;
  /** Called with the state a tap asks for */
  onPressedChange: (pressed: boolean) => void;
}

/**
 * A toggle: an `IconButton` with `aria-pressed`, whose icon and label can
 * change with its state. Keep the `aria-label` the same in both states,
 * the pressed state says the rest.
 */
export const IconToggle = ({
  pressed,
  icon,
  pressedIcon = icon,
  label,
  pressedLabel = label,
  onPressedChange,
  ...props
}: IconToggleProps) => (
  <IconButton
    icon={pressed ? pressedIcon : icon}
    label={pressed ? pressedLabel : label}
    aria-pressed={pressed}
    onClick={() => onPressedChange(!pressed)}
    {...props}
  />
);
