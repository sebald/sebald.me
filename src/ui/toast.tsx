'use client';

import { Toast as Primitive } from '@base-ui/react/toast';
import { CheckIcon, WarningIcon, XIcon } from '@phosphor-icons/react/ssr';
import type { PropsWithChildren } from 'react';

import { cva } from '@/lib/styles.utils';

import { styles as buttonStyles } from './button';

// Styles
// ---------------
const styles = {
  viewport: cva({
    base: [
      'z-110',
      'fixed bottom-4 left-1/2 -translate-x-1/2',
      'flex flex-col-reverse items-center gap-2',
      'w-max max-w-[calc(100vw-2rem)]',
    ],
  }),
  root: cva({
    base: [
      'ui-panel',
      'flex items-center gap-3 py-2 pr-2 pl-4',
      'text-sm text-mist-200',
      'transition-all duration-150',
      'data-starting-style:opacity-0 data-starting-style:translate-y-4',
      'data-ending-style:opacity-0 data-ending-style:translate-y-4',
      '[&_svg]:size-4 [&_svg]:shrink-0',
    ],
  }),
  close: cva({
    base: [buttonStyles({ variant: 'icon' }), 'size-8 bg-transparent'],
  }),
};

// Manager
// ---------------
/**
 * Global toast manager, allows to show toasts from anywhere
 * (e.g. event handlers) without a hook.
 *
 * @example
 * toast.add({ title: 'Link copied' });
 * toast.add({ title: 'Could not copy', type: 'error' });
 */
export const toast = Primitive.createToastManager();

// Toast List
// ---------------
const ToastList = () => {
  const { toasts } = Primitive.useToastManager();

  return toasts.map(t => (
    <Primitive.Root key={t.id} toast={t} className={styles.root()}>
      {t.type === 'error' ? (
        <WarningIcon weight="bold" aria-hidden />
      ) : (
        <CheckIcon weight="bold" aria-hidden />
      )}
      <Primitive.Title />
      <Primitive.Close aria-label="Dismiss" className={styles.close()}>
        <XIcon aria-hidden />
      </Primitive.Close>
    </Primitive.Root>
  ));
};

// Toaster
// ---------------
/**
 * Renders toasts queued via `toast`. Mount once, near the root.
 */
export const Toaster = ({ children }: PropsWithChildren) => (
  <Primitive.Provider toastManager={toast} timeout={3000}>
    {children}
    <Primitive.Portal>
      <Primitive.Viewport className={styles.viewport()}>
        <ToastList />
      </Primitive.Viewport>
    </Primitive.Portal>
  </Primitive.Provider>
);
