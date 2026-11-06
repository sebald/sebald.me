'use client';

import type { ReactNode } from 'react';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '../dialog/dialog';
import { Picker, PickerItem } from '../picker/picker';
import { Text } from '../text/text';
import { Legend } from '../window/window';

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
 * Asks before something that cannot be undone: a `Dialog` (an
 * `alertdialog`) with what it costs and two options, the safe one first
 * and selected. Escape cancels, a tap outside does nothing. Render it
 * while the question is open, anywhere inside the stage.
 */
export const Confirm = ({
  title,
  children,
  confirm,
  cancel = 'Cancel',
  onConfirm,
  onCancel,
  className,
}: ConfirmProps) => (
  <Dialog
    open
    role="alertdialog"
    onOpenChange={open => !open && onCancel()}
    className={className}
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Text className="text-balance">{children}</Text>
    </DialogContent>
    <DialogActions>
      <Picker label={title} initial="cancel">
        <PickerItem id="cancel" variant="back" onSelect={onCancel}>
          {cancel}
        </PickerItem>
        <PickerItem id="confirm" onSelect={onConfirm}>
          {confirm}
        </PickerItem>
      </Picker>
    </DialogActions>
    <Legend
      keys={[
        ['↑↓', 'choose'],
        ['Enter', 'confirm'],
        ['Esc', 'cancel'],
      ]}
      touch="Tap a line"
    />
  </Dialog>
);
