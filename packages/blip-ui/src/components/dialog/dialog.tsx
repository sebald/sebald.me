'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { KeyLayerContext, useKeyLayer } from '../../hooks/key-layer';
import { useFeedback } from '../../providers/feedback';
import type { VariantProps } from '../../utils/styles';
import { PartsContext, type PartsValue } from '../parts/parts';
import { WindowFrame } from '../window/window';
import { dialog as styles } from './dialog.styles';

type Variants = VariantProps<typeof styles.popup>;

/** What its content says, as Base UI's description (a `div`, it may hold a list) */
const Description = (props: object) => (
  <BaseDialog.Description render={<div />} {...props} />
);

/** Its title names it and its content describes it, through Base UI's parts */
const PARTS: PartsValue = { title: BaseDialog.Title, content: Description };

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
  /** Its parts: a `Title` (it names the dialog), `Content`, `Actions`, a `Legend` */
  children: ReactNode;
  className?: string;
}

/**
 * A window over the stage: the stage dimmed down to the bar of
 * controls, the window in the middle, drawn as a `Window` is. While it
 * is open it has the keys (the screen under it hears none) and the
 * focus; Escape or a tap outside closes it, and sounds like going back.
 * Modal: a tap on a control under it only closes it, and the page holds
 * still.
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
        // Modal: the focus stays in it, and a tap anywhere else (a corner
        // control) only closes it; the page holds still while it is open
        modal
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
                <PartsContext value={PARTS}>
                  <WindowFrame bodyClassName={styles.body()}>
                    {children}
                  </WindowFrame>
                </PartsContext>
              </KeyLayerContext>
            </BaseDialog.Popup>
          </BaseDialog.Portal>
        )}
      </BaseDialog.Root>
    </>
  );
};
