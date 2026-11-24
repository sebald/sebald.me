'use client';

import { Field as BaseField } from '@base-ui/react/field';
import {
  type ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

import { field as styles } from './field.styles';

/** How much more a control takes, as it tells its field */
export interface FieldCount {
  /** The most characters it takes */
  max: number;
  /** How many it holds now */
  length: number;
}

interface FieldValue {
  /** The control's limit and how full it is, or `null` for none */
  count: (count: FieldCount | null) => void;
  /** An error came (`1`) or went (`-1`) */
  error: (change: 1 | -1) => void;
}

/**
 * What a `Field` hears from what is in it: the control says how many
 * characters it holds, an error that it is there. `null` outside a field
 */
export const FieldContext = createContext<FieldValue | null>(null);

export interface FieldProps {
  /** The control and the words around it: `FieldLabel`, `FieldDescription`, `FieldError` */
  children: ReactNode;
  /**
   * Whether the control ignores the player; it and its label are dim
   * @default false
   */
  disabled?: boolean;
  /** Identifies the control's value when a form is submitted */
  name?: string;
  className?: string;
}

/**
 * A form control with its label, what it is for and what is wrong with
 * it: every control a player fills in or sets goes in one, so their labels
 * line up and read alike. The label sits in the window's label column on
 * a wide stage and above the control on a tall one; the description, the
 * error and, for a control with a limit, the characters left go under
 * it. It ties them to the control for a screen reader, whatever the
 * control is, and a `FieldError` in it marks the control invalid. Built
 * on Base UI's Field.
 */
export const Field = ({
  children,
  disabled = false,
  name,
  className,
}: FieldProps) => {
  const [count, setCount] = useState<FieldCount | null>(null);
  const [errors, setErrors] = useState(0);
  const [value] = useState<FieldValue>(() => ({
    count: setCount,
    error: change => setErrors(n => n + change),
  }));
  const left = count && count.max - count.length;
  const full = left !== null && left <= 0;
  return (
    <BaseField.Root
      data-slot="field"
      name={name}
      disabled={disabled}
      invalid={errors > 0 || undefined}
      className={styles.root({ className })}
    >
      <FieldContext value={value}>{children}</FieldContext>
      {count && (
        <>
          {/* The limit is said with the control; the number is for the eyes */}
          <BaseField.Description className="sr-only">
            Up to {count.max} characters.
          </BaseField.Description>
          <span
            aria-hidden
            data-slot="field-count"
            data-full={full || undefined}
            data-disabled={disabled || undefined}
            className={styles.count()}
          >
            {left}
          </span>
        </>
      )}
    </BaseField.Root>
  );
};

export interface FieldPartProps {
  children: ReactNode;
  className?: string;
}

/** What the control asks for or sets, its name: `Name`, `Music` */
export const FieldLabel = ({ children, className }: FieldPartProps) => (
  <BaseField.Label
    data-slot="field-label"
    className={styles.label({ className })}
  >
    {children}
  </BaseField.Label>
);

/** A line that says what to type or in what form, read with the control */
export const FieldDescription = ({ children, className }: FieldPartProps) => (
  <BaseField.Description
    data-slot="field-description"
    className={styles.description({ className })}
  >
    {children}
  </BaseField.Description>
);

/**
 * What is wrong, as a sentence that says what to do about it. While it is
 * there the control is invalid and the sentence is read with it
 */
export const FieldError = ({ children, className }: FieldPartProps) => {
  const field = useContext(FieldContext);
  useLayoutEffect(() => {
    if (!field) return;
    field.error(1);
    return () => field.error(-1);
  }, [field]);
  return (
    <BaseField.Error
      data-slot="field-error"
      match
      className={styles.error({ className })}
    >
      {children}
    </BaseField.Error>
  );
};
