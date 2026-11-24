'use client';

import { Input } from '@base-ui/react/input';
import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

import { useAnnounce } from '../../providers/announcer';
import { useFeedback } from '../../providers/feedback';
import {
  Field,
  FieldContext,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '../field/field';
import { textField as styles } from './text-field.styles';

export interface TextInputProps extends Omit<
  ComponentProps<'input'>,
  | 'children'
  | 'className'
  | 'defaultValue'
  | 'maxLength'
  | 'onChange'
  | 'onSubmit'
  | 'size'
  | 'type'
  | 'value'
> {
  /** The text (controlled) */
  value?: string;
  /**
   * The text at first (uncontrolled)
   * @default ''
   */
  defaultValue?: string;
  /** The text changed */
  onValueChange?: (value: string) => void;
  /** Enter was pressed, with the text; the field keeps the focus */
  onSubmit?: (value: string) => void;
  /**
   * The most characters it takes. Its `Field` shows the characters left,
   * and a screen reader hears when it is full
   */
  maxLength?: number;
  className?: string;
}

/**
 * The line a player types in, as the control of a `Field`: the text in
 * the stage's font with a caret. A native `<input>`, so the phone's
 * keyboard opens on the tall stage. The kit's keys leave a focused input
 * alone, so letters are typed and not taken for moves; Enter submits and
 * Escape gives the keys back to the screen without leaving it. Other
 * props go to the input (`placeholder`, `autoComplete`). Built on Base
 * UI's Input.
 */
export const TextInput = ({
  value,
  defaultValue = '',
  onValueChange,
  onSubmit,
  maxLength,
  className,
  onKeyDown,
  onFocus,
  ...props
}: TextInputProps) => {
  const play = useFeedback();
  const announce = useAnnounce();
  const field = useContext(FieldContext);
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const full = maxLength !== undefined && text.length >= maxLength;

  // The field shows the characters left and says the limit
  useLayoutEffect(() => {
    if (!field || maxLength === undefined) return;
    field.count({ max: maxLength, length: text.length });
    return () => field.count(null);
  }, [field, maxLength, text.length]);

  const keydown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') {
      play('confirm');
      onSubmit?.(text);
    } else if (event.key === 'Escape') {
      // Not also a dialog's or a screen's back: this one only lets go
      event.stopPropagation();
      play('back');
      event.currentTarget.blur();
    } else if (
      full &&
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      // Typing past the limit: the field refuses and says so
      play('bump');
      announce(`Limit of ${maxLength} characters reached`);
    }
  };

  return (
    <Input
      {...props}
      data-slot="text-input"
      value={text}
      maxLength={maxLength}
      // The phone's keyboard shows its own "done" for Enter
      enterKeyHint="done"
      className={styles.input({ className })}
      onKeyDown={keydown}
      onFocus={event => {
        onFocus?.(event);
        // Held upright the keyboard covers the lower stage: keep the
        // field in view
        event.currentTarget.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        });
      }}
      onValueChange={next => {
        if (next.length > text.length) play('type', next.slice(text.length));
        setInner(next);
        onValueChange?.(next);
        if (maxLength !== undefined && next.length >= maxLength)
          announce(`Limit of ${maxLength} characters reached`);
      }}
    />
  );
};

export interface TextFieldProps extends Omit<TextInputProps, 'className'> {
  /** What it asks for, its label: `Name` */
  children: ReactNode;
  /** A line under it that says what to type or in what form */
  description?: string;
  /** What is wrong with the text. Its presence marks the field invalid */
  error?: string;
  className?: string;
}

/**
 * One line of text the player types, such as a name, with its label: a
 * `Field` holding a `TextInput`, the commonest form a game asks for in
 * one element. `description` and `error` are its `FieldDescription` and
 * `FieldError`; other props go to the input. For anything else around
 * the input, compose the `Field` yourself.
 */
export const TextField = ({
  children,
  description,
  error,
  disabled,
  name,
  className,
  ...props
}: TextFieldProps) => (
  <Field disabled={disabled} name={name} className={className}>
    <FieldLabel>{children}</FieldLabel>
    <TextInput {...props} />
    {description && <FieldDescription>{description}</FieldDescription>}
    {error && <FieldError>{error}</FieldError>}
  </Field>
);
