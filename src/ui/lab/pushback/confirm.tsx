'use client';

import { useMemo } from 'react';

import { Picker } from './picker';
import { Heading, Muted } from './text';
import { useKeys } from './use-keys';
import { Legend, Window } from './window';

export interface ConfirmProps {
  title: string;
  /** What it costs, in a line or two */
  children: React.ReactNode;
  /** The label of the option that does it */
  confirm: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Asks before something that cannot be undone: the stage dimmed, a
 * quiet window in the middle with what it costs, and two options, the
 * safe one first and selected. Escape cancels.
 */
export const Confirm = ({
  title,
  children,
  confirm,
  onConfirm,
  onCancel,
}: ConfirmProps) => {
  useKeys(useMemo(() => ({ Escape: onCancel }), [onCancel]));
  return (
    <div
      role="alertdialog"
      aria-label={title}
      className="absolute inset-0 z-10 flex items-center justify-center bg-(--pb-bg)/80"
    >
      <Window
        className="w-[70%]"
        legend={
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
              ['Esc', 'cancel'],
            ]}
            touch="Tap a line"
          />
        }
      >
        <div className="grid gap-[calc(var(--px)*3)]">
          <Heading>{title}</Heading>
          <Muted className="text-balance">{children}</Muted>
          <Picker
            label={title}
            className="mt-[calc(var(--px)*2)]"
            initial="cancel"
            items={[
              { id: 'cancel', label: 'Cancel', onSelect: onCancel },
              { id: 'confirm', label: confirm, onSelect: onConfirm },
            ]}
          />
        </div>
      </Window>
    </div>
  );
};
