'use client';

import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from 'react';

import { useAnnounce } from '../../providers/announcer';
import { useFeedback } from '../../providers/feedback';
import { cn } from '../../utils/styles';
import { textField as styles } from './text-field.styles';

export interface TextFieldProps extends Omit<
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
  /** What it asks for, its label: `Name` */
  children: ReactNode;
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
   * The most characters it takes. The characters left are shown beside
   * the label, and a screen reader hears when it is full
   */
  maxLength?: number;
  /** A line under it that says what to type or in what form */
  description?: string;
  /** What is wrong with the text. Its presence marks the field invalid */
  error?: string;
  className?: string;
}

/**
 * One line of text the player types, such as a name: a label, the text
 * in the stage's font with a caret, and optionally the characters left.
 * A native `<input>` tied to its label, so the phone's keyboard opens on
 * the tall stage. The kit's keys leave a focused field alone, so letters
 * are typed and not taken for moves; Enter submits and Escape gives the
 * keys back to the screen without leaving it. Other props go to the
 * input (`name`, `placeholder`, `autoComplete`, `disabled`). Built on
 * Base UI's Field and Input.
 */
export const TextField = ({
  children,
  value,
  defaultValue = '',
  onValueChange,
  onSubmit,
  maxLength,
  description,
  error,
  disabled,
  className,
  onKeyDown,
  onFocus,
  ...props
}: TextFieldProps) => {
  const play = useFeedback();
  const announce = useAnnounce();
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const left = maxLength === undefined ? undefined : maxLength - text.length;
  const full = left !== undefined && left <= 0;

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
    <Field.Root
      data-slot="text-field"
      disabled={disabled}
      invalid={error !== undefined || undefined}
      className={styles.root({ className })}
    >
      <div className={styles.row()}>
        <Field.Label className={styles.label()}>{children}</Field.Label>
        {left !== undefined && (
          // The limit is in the description; this is only for the eyes
          <span
            aria-hidden
            data-full={full || undefined}
            className={styles.count()}
          >
            {left}
          </span>
        )}
      </div>
      <Input
        {...props}
        value={text}
        maxLength={maxLength}
        // The phone's keyboard shows its own "done" for Enter
        enterKeyHint="done"
        className={styles.input()}
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
          if (next !== text) play('type');
          setInner(next);
          onValueChange?.(next);
          if (maxLength !== undefined && next.length >= maxLength)
            announce(`Limit of ${maxLength} characters reached`);
        }}
      />
      {(description || maxLength !== undefined) && (
        <Field.Description
          className={cn(styles.description(), !description && 'sr-only')}
        >
          {description}
          {maxLength !== undefined && (
            <span className="sr-only"> Up to {maxLength} characters.</span>
          )}
        </Field.Description>
      )}
      {error !== undefined && (
        <Field.Error match className={styles.error()}>
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
};
