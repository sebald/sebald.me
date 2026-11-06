'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { KeyLayerContext, useKeyLayer } from '../../hooks/key-layer';
import { useFeedback } from '../../providers/feedback';
import type { VariantProps } from '../../utils/styles';
import { WindowFrame } from '../window/window';
import { dialog as styles } from './dialog.styles';

type Variants = VariantProps<typeof styles.popup>;

export interface DialogProps {
  /** Whether it is open (controlled) */
  open?: boolean;
  /**
   * Whether it is open at first (uncontrolled)
   * @default false
   */
  defaultOpen?: boolean;
  /** It opens or closes: Escape, a tap outside, or a part asking */
  onOpenChange?: (open: boolean) => void;
  /**
   * `alertdialog` asks before something that cannot be undone: a tap
   * outside does not close it, only Escape or an answer does
   * @default 'dialog'
   */
  role?: 'dialog' | 'alertdialog';
  /**
   * How much of the stage it takes
   * @default 'default'
   */
  size?: NonNullable<Variants['size']>;
  /** Its parts: `DialogTitle`, `DialogContent`, `DialogActions`, a `Legend` */
  children: ReactNode;
  className?: string;
}

/**
 * A window over the stage: the stage dimmed down to the bar of
 * controls, the window in the middle, drawn as a `Window` is. While it
 * is open it has the keys (the screen under it hears none) and the
 * focus; Escape or a tap outside closes it, and sounds like going back.
 * Place it anywhere inside the stage: it covers the stage, not its
 * parent. Built on Base UI's Dialog.
 */
export const Dialog = ({
  open,
  defaultOpen = false,
  onOpenChange,
  role = 'dialog',
  size,
  className,
  children,
}: DialogProps) => {
  const play = useFeedback();
  const [inner, setInner] = useState(defaultOpen);
  const shown = open ?? inner;
  const layer = useKeyLayer(shown);
  const popup = useRef<HTMLDivElement>(null);

  // The stage it covers, found from where it is placed
  const anchor = useRef<HTMLSpanElement>(null);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    // Only the DOM knows which stage it is in, and only after a render;
    // once, before the frame is painted
    // oxlint-disable-next-line react/set-state-in-effect
    setStage(
      anchor.current?.closest<HTMLElement>('[data-stage]') ?? document.body,
    );
  }, []);

  return (
    <>
      <span ref={anchor} hidden />
      <BaseDialog.Root
        open={shown}
        // The focus is held, the page under the game still scrolls
        modal="trap-focus"
        disablePointerDismissal={role === 'alertdialog'}
        onOpenChange={(next, details) => {
          if (
            !next &&
            (details.reason === 'escape-key' ||
              details.reason === 'outside-press')
          )
            play('back');
          setInner(next);
          onOpenChange?.(next);
        }}
      >
        {stage && (
          <BaseDialog.Portal
            container={stage}
            data-slot="dialog"
            className={styles.root()}
          >
            <BaseDialog.Popup
              ref={popup}
              role={role}
              // On the window, not its first button: the keys pick, so a
              // focus ring on an item would only be a second cursor
              initialFocus={popup}
              className={styles.popup({ size, className })}
            >
              <KeyLayerContext value={layer}>
                <WindowFrame bodyClassName={styles.body()}>
                  {children}
                </WindowFrame>
              </KeyLayerContext>
            </BaseDialog.Popup>
          </BaseDialog.Portal>
        )}
      </BaseDialog.Root>
    </>
  );
};

export interface DialogPartProps {
  children: ReactNode;
  className?: string;
}

/** The dialog's title, which names it for assistive technology */
export const DialogTitle = ({ className, children }: DialogPartProps) => (
  <BaseDialog.Title
    data-slot="dialog-title"
    className={styles.title({ className })}
  >
    {children}
  </BaseDialog.Title>
);

/** What it says: a line or two, a list; it describes the dialog */
export const DialogContent = ({ className, children }: DialogPartProps) => (
  <BaseDialog.Description
    data-slot="dialog-content"
    render={<div />}
    className={styles.content({ className })}
  >
    {children}
  </BaseDialog.Description>
);

/** What can be done: a `Picker`, or buttons side by side */
export const DialogActions = ({ className, children }: DialogPartProps) => (
  <div data-slot="dialog-actions" className={styles.actions({ className })}>
    {children}
  </div>
);
