'use client';

import { type FormEvent, type ReactNode, useEffect, useRef } from 'react';

import { LINE, useKeyScope, useKeydown } from '../../hooks/key-layer';
import { useFeedback } from '../../providers/feedback';
import { form as styles } from './form.styles';

export interface FormProps {
  /** Its rows: `Field`s, and `Actions` with the buttons */
  children: ReactNode;
  /** It was sent (Enter in a field, or a button with `type="submit"`), with its fields' values by `name` */
  onSubmit?: (data: FormData) => void;
  className?: string;
}

/** A row the arrows stop at: a field's control, or a row of buttons */
const ROWS = '[data-slot=field], [data-slot=actions]';
/** What in a row takes the focus */
const FOCUSABLE =
  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** A row's stops: a field's one control, or each button in a row of them */
const stops = (row: Element) =>
  row.matches('[data-slot=actions]')
    ? [...row.querySelectorAll<HTMLElement>(FOCUSABLE)]
    : [row.querySelector<HTMLElement>(FOCUSABLE)].filter(
        (stop): stop is HTMLElement => stop !== null,
      );

/**
 * A form window's controls, moved between as a game does: Up and Down go
 * from row to row (wrapping at the ends), Left and Right along a row of
 * buttons, Enter in a field sends the form, Esc leaves a field. Each
 * `Field` is a row and an `Actions` its buttons, in the order they are
 * written; nobody hooks up keys. Tab works as on the web, so a screen
 * reader and a keyboard user lose nothing. A native `<form>`, so `name`s
 * and a button with `type="submit"` work as they do in a browser. It goes
 * inside a window's `Content`, and lays its rows out as the `Content`
 * does. A form and a menu share the arrows of a screen as two menus do:
 * the one last pointed at or focused has them. A window is a menu or a
 * form, so a `Picker` inside a `Form` is refused.
 */
export const Form = ({ children, onSubmit, className }: FormProps) => {
  const ref = useRef<HTMLFormElement>(null);
  const play = useFeedback();
  const { holds } = useKeyScope('menu', ref);
  // The row last left, so the next arrow after Esc goes back to it
  const last = useRef<Element | null>(null);

  useKeydown(
    event => {
      const root = ref.current;
      if (!root || !holds()) return;
      const target = event.target as HTMLElement | null;
      const inside = !!target && root.contains(target);
      // Keys on something outside the form are its own
      if (!inside && target !== document.body) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const rows = [...root.querySelectorAll(ROWS)].filter(
        row => stops(row).length > 0,
      );
      const at = inside ? rows.findIndex(row => row.contains(target)) : -1;
      const row = at === -1 ? undefined : rows[at];

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!rows.length) return;
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const from =
          at !== -1
            ? at
            : last.current && rows.includes(last.current)
              ? rows.indexOf(last.current) - step
              : step === 1
                ? -1
                : rows.length;
        const next = rows[(from + step + rows.length) % rows.length]!;
        play('move');
        stops(next)[0]!.focus();
        return;
      }

      if (
        row?.matches('[data-slot=actions]') &&
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
      ) {
        const buttons = stops(row);
        const here = buttons.indexOf(target!);
        if (here === -1) return;
        event.preventDefault();
        const step = event.key === 'ArrowRight' ? 1 : -1;
        play('move');
        buttons[(here + step + buttons.length) % buttons.length]!.focus();
        return;
      }

      // Enter in a line of text sends the form, as a game's "done"
      if (event.key === 'Enter' && inside && target!.matches(LINE)) {
        root.requestSubmit();
      }
    },
    true,
    // A single line of text has no use for these: they are the form's
    { fromLine: ['ArrowUp', 'ArrowDown', 'Enter'] },
  );

  // Remember the row the focus was last in
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const remember = (event: FocusEvent) => {
      last.current = (event.target as Element).closest(ROWS);
    };
    root.addEventListener('focusin', remember);
    return () => root.removeEventListener('focusin', remember);
  }, []);

  // A window is a menu or a form: say so while building one
  useEffect(() => {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production')
      return;
    if (ref.current?.querySelector('[data-slot=picker]'))
      console.error(
        'Blip UI: a Picker inside a Form. A window is a menu or a form (`docs/blip-harness/research/forms-and-navigation.md`, decision 1): give the menu its own window, or make its choices fields.',
      );
  });

  return (
    <form
      ref={ref}
      data-slot="form"
      noValidate
      className={styles.root({ className })}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit?.(new FormData(event.currentTarget));
      }}
    >
      {children}
    </form>
  );
};
