'use client';

import type {
  ButtonHTMLAttributes,
  MouseEvent,
  PointerEvent,
  ReactNode,
} from 'react';

import type { VariantProps } from '../../utils/styles';
import { type IconName } from '../pixel-icon/icons';
import { PixelIcon } from '../pixel-icon/pixel-icon';
import { iconButton } from './icon-button.styles';

type Variants = VariantProps<typeof iconButton>;

/** CSS pixels per icon pixel on the bar, where a thumb sets the size */
const BAR_DOT = 1.5;

// A tap on a control is not a tap that opens a menu, moves a duel on or
// leaves a demo: it stays with the control
const keep = (event: PointerEvent) => event.stopPropagation();

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> {
  /** What the button does, for assistive technology (and a hint of its key) */
  'aria-label': string;
  /** Which icon, by name */
  icon: IconName;
  /**
   * `corner` is the icon alone in a corner of the wide stage, `bar` sits in
   * the tall stage's bar and shows its `label`
   * @default 'corner'
   */
  variant?: NonNullable<Variants['variant']>;
  /** Text beside the icon on the bar; the corner never shows it */
  label?: ReactNode;
  /** Put the label before the icon, like the sound button on the bar */
  labelFirst?: boolean;
}

/**
 * A round of the controls: an icon in a button at least 44 CSS pixels to
 * touch. A tap stays with it (`pointerdown` and `click` do not bubble).
 * Place it with `className` and `style`, or put it in `Controls`.
 */
export const IconButton = ({
  icon,
  variant,
  label,
  labelFirst = false,
  className,
  onClick,
  children,
  ...props
}: IconButtonProps) => {
  const bar = variant === 'bar';
  const shown = bar ? label : null;
  return (
    <button
      type="button"
      className={iconButton({ variant, className })}
      onPointerDown={keep}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      {...props}
    >
      {labelFirst && shown}
      <PixelIcon icon={icon} dot={bar ? BAR_DOT : undefined} />
      {!labelFirst && shown}
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
