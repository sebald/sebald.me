'use client';

import { Dialog as Primitive } from '@base-ui/react/dialog';
import type { DialogRootProps as PrimitiveRootProps } from '@base-ui/react/dialog';
import { cva, VariantProps } from 'cva';
import { createContext, use } from 'react';
import type { ComponentProps } from 'react';

import { styles as buttonStyles } from './button';
import { style as headlineStyle } from './headline';
import { style as textStyle } from './text';

interface DialogContextType {
  modal: PrimitiveRootProps['modal'];
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialogContext = () => {
  const context = use(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within Dialog.Root');
  }
  return context;
};

export const styles = {
  trigger: buttonStyles,
  backdrop: cva({
    base: [
      'backdrop-blur-xs fixed inset-0 min-h-dvh bg-white/40',
      'z-100',
      'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
      // iOS 26+: Ensure the backdrop covers the entire visible viewport.
      'supports-[-webkit-touch-callout:none]:absolute',
    ],
  }),
  popup: cva({
    base: [
      'z-100',
      'fixed max-w-content',
      'transition-all duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
      'surface surface-opaque rounded-3xl p-6',
    ],
    variants: {
      position: {
        center: [
          'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-8',
          'transition-all duration-150 data-starting-style:scale-90 data-ending-style:scale-90',
        ],
        bottom: [
          'bottom-0 left-1/2 -translate-x-1/2 mb-4',
          'data-starting-style:translate-y-full data-ending-style:translate-y-full',
        ],
      },
      size: {
        small: 'w-sm',
        medium: 'w-md',
        large: 'w-2xl',
        full: 'w-full',
      },
    },
    defaultVariants: {
      position: 'center',
      size: 'medium',
    },
  }),
  title: cva({
    base: '',
  }),
  description: cva({
    base: '',
  }),
  actions: cva({
    base: 'flex shrink-0 gap-3',
  }),
};

const DialogRoot = ({ children, ...props }: PrimitiveRootProps) => (
  <DialogContext.Provider value={{ modal: props.modal }}>
    <Primitive.Root {...props}>{children}</Primitive.Root>
  </DialogContext.Provider>
);

const DialogContent = ({
  children,
  position,
  size,
  ...props
}: ComponentProps<typeof Primitive.Popup> &
  VariantProps<typeof styles.popup>) => {
  const { modal } = useDialogContext();

  return (
    <Primitive.Portal>
      {modal === true || modal === undefined ? (
        <Primitive.Backdrop className={styles.backdrop()} />
      ) : null}
      <Primitive.Popup {...props} className={styles.popup({ position, size })}>
        {children}
      </Primitive.Popup>
    </Primitive.Portal>
  );
};

const DialogTitle = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Title>) => (
  <Primitive.Title {...props} className={headlineStyle({ level: '4' })}>
    {children}
  </Primitive.Title>
);

const DialogDescription = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Description>) => (
  <Primitive.Description {...props} className={textStyle({ size: 'body' })}>
    {children}
  </Primitive.Description>
);

const DialogActions = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={styles.actions()}>
    {children}
  </div>
);

export interface DialogTriggerProps
  extends ComponentProps<typeof Primitive.Trigger>,
    VariantProps<typeof styles.trigger> {}

const DialogTrigger = ({ children, variant, ...props }: DialogTriggerProps) => (
  <Primitive.Trigger {...props} className={styles.trigger({ variant })}>
    {children}
  </Primitive.Trigger>
);

const DialogClose = ({
  children,
  ...props
}: Omit<ComponentProps<typeof Primitive.Close>, 'className' | 'style'>) => (
  <Primitive.Close {...props} className={buttonStyles({ variant: 'ghost' })}>
    {children}
  </Primitive.Close>
);

export const Dialog = Object.assign(DialogContent, {
  Root: DialogRoot,
  Title: DialogTitle,
  Description: DialogDescription,
  Actions: DialogActions,
  Trigger: DialogTrigger,
  Close: DialogClose,
});
