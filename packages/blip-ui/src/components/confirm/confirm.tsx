'use client';

import { type ReactNode, useMemo } from 'react';

import { useKeys } from '../../hooks/use-keys';
import { Picker } from '../picker/picker';
import { Heading, Muted } from '../text/text';
import { Legend, Window } from '../window/window';
import { confirm as styles } from './confirm.styles';

export interface ConfirmProps {
  title: string;
  /** What it costs, in a line or two */
  children: ReactNode;
  /** The label of the option that does it */
  confirm: string;
  /**
   * The label of the safe option, first and selected
   * @default 'Cancel'
   */
  cancel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

/**
 * Asks before something that cannot be undone: the stage dimmed, a
 * quiet window in the middle with what it costs, and two options, the
 * safe one first and selected. Escape cancels. Place it inside the
 * stage: it covers it, down to the bar of controls (`--bui-bar`).
 */
export const Confirm = ({
  title,
  children,
  confirm,
  cancel = 'Cancel',
  onConfirm,
  onCancel,
  className,
}: ConfirmProps) => {
  useKeys(useMemo(() => ({ Escape: onCancel }), [onCancel]));
  return (
    <div
      role="alertdialog"
      aria-label={title}
      className={styles.root({ className })}
    >
      <Window
        className={styles.window()}
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
        <div className={styles.body()}>
          <Heading>{title}</Heading>
          <Muted className="text-balance">{children}</Muted>
          <Picker
            label={title}
            className={styles.picker()}
            initial="cancel"
            items={[
              { id: 'cancel', label: cancel, back: true, onSelect: onCancel },
              { id: 'confirm', label: confirm, onSelect: onConfirm },
            ]}
          />
        </div>
      </Window>
    </div>
  );
};
