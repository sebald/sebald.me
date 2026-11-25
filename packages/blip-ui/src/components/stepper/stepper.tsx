'use client';

import { useFieldRootContext } from '@base-ui/react/internals/field-root-context';
import {
  useLabelableContext,
  useLabelableId,
} from '@base-ui/react/internals/labelable-provider';
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';

import { useFeedback } from '../../providers/feedback';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '../field/field';
import { Step } from '../setting/setting';
import { stepper as styles } from './stepper.styles';

export interface StepperControlProps {
  /**
   * What it can be, in order, as shown and as sent with a form:
   * `['Off', 'On']` is a switch, anything else steps through its values
   * (`['Normal', 'Hard']`, `['Slow', 'Normal', 'Fast']`)
   */
  values: readonly string[];
  /** The value now (controlled) */
  value?: string;
  /** The value at first (uncontrolled); the first of `values` by default */
  defaultValue?: string;
  /** The value changed: Left, Right, Enter, Space or a tap */
  onValueChange?: (value: string) => void;
  /** Whether it ignores the player; dim. Its `Field`'s `disabled` does the same */
  disabled?: boolean;
  /** Identifies its value when a form is submitted; its `Field`'s `name` does the same */
  name?: string;
  className?: string;
}

/**
 * A value between two step arrows, as the control of a `Field`: Left and
 * Right step it and it goes round, Enter, Space and a tap step it on.
 * Off and On are a switch to a screen reader; any other values a slider
 * that says its value (`Difficulty, Normal`), two of them included. Up and Down are left to the `Form`, so it is a row like any
 * other. A tap on its label steps it too, so the whole row is the target.
 */
export const StepperControl = ({
  values,
  value,
  defaultValue,
  onValueChange,
  disabled: disabledProp = false,
  name: nameProp,
  className,
}: StepperControlProps) => {
  const play = useFeedback();
  const field = useFieldRootContext(false);
  const { labelId, getDescriptionProps } = useLabelableContext();
  // Not a labelable element: the label names it by `aria-labelledby`
  useLabelableId({ id: null });
  const ref = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState(defaultValue ?? values[0]);
  const current = value ?? inner;
  const at = Math.max(0, values.indexOf(current ?? ''));
  const disabled = disabledProp || !!field.disabled;
  const name = field.name ?? nameProp;
  // Only Off and On are on or off; Normal and Hard read as their words
  const toggle =
    values.length === 2 && values[0] === 'Off' && values[1] === 'On';
  // Two values flip, whatever their words
  const binary = values.length === 2;

  const step = (by: number) => {
    if (disabled || values.length < 2) return;
    const next = values[(at + by + values.length) % values.length]!;
    play('move');
    setInner(next);
    onValueChange?.(next);
  };
  const to = (index: number) => {
    if (disabled || index === at) return;
    play('move');
    setInner(values[index]!);
    onValueChange?.(values[index]!);
  };

  // A tap on the field's label steps it as a tap on the value does: the
  // label is not tied to it by `for`, which only a native control takes
  const tapLabel = useEffectEvent(() => {
    ref.current?.focus({ preventScroll: true });
    step(1);
  });
  useEffect(() => {
    const label = ref.current
      ?.closest('[data-slot=field]')
      ?.querySelector('[data-slot=field-label]');
    if (!label) return;
    const tap = () => tapLabel();
    label.addEventListener('click', tap);
    return () => label.removeEventListener('click', tap);
  }, []);

  const keydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    // A held key runs through the steps; it would only blink a switch
    if (binary && event.repeat) return;
    const by =
      event.key === 'ArrowLeft'
        ? -1
        : event.key === 'ArrowRight' ||
            event.key === 'Enter' ||
            event.key === ' '
          ? 1
          : 0;
    if (by) {
      event.preventDefault();
      step(by);
    } else if (!binary && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault();
      to(event.key === 'Home' ? 0 : values.length - 1);
    }
  };

  return (
    // A switch or a slider, by its values: the rule reads only a fixed role
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={ref}
      data-slot="stepper"
      {...getDescriptionProps({})}
      role={toggle ? 'switch' : 'slider'}
      {...(toggle
        ? { 'aria-checked': at === 1 }
        : {
            'aria-orientation': 'horizontal' as const,
            'aria-valuemin': 0,
            'aria-valuemax': values.length - 1,
            'aria-valuenow': at,
            'aria-valuetext': values[at],
          })}
      aria-labelledby={labelId}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? undefined : 0}
      className={styles.root({ className })}
      onKeyDown={keydown}
      onClick={() => step(1)}
    >
      <Step points="left" className={styles.step()} />
      <span className={styles.value()}>{values[at]}</span>
      <Step className={styles.step()} />
      {name !== undefined && (
        <input type="hidden" name={name} value={values[at] ?? ''} />
      )}
    </div>
  );
};

export interface StepperProps extends Omit<StepperControlProps, 'className'> {
  /** What it sets, its label: `Music` */
  children: ReactNode;
  /** A line under it that says what the setting does */
  description?: string;
  /** What is wrong with the value. Its presence marks the field invalid */
  error?: string;
  /** Goes on the `Field`, the row; a `StepperControl` takes its own */
  className?: string;
}

/**
 * The form's one choice control, a setting with its label: `Music ◀ On ▶`,
 * `Speed ◀ Normal ▶`. A `Field` holding a `StepperControl`: two values flip
 * (On and Off), more step and go round. `description` and `error` are its
 * `FieldDescription` and `FieldError`. In a menu, the same row is a
 * `PickerSetting`.
 */
export const Stepper = ({
  children,
  description,
  error,
  disabled,
  name,
  className,
  ...props
}: StepperProps) => (
  <Field disabled={disabled} name={name} className={className}>
    <FieldLabel>{children}</FieldLabel>
    <StepperControl {...props} />
    {description && <FieldDescription>{description}</FieldDescription>}
    {error && <FieldError>{error}</FieldError>}
  </Field>
);
