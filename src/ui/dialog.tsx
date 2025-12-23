'use client';

import { Dialog as Primitive } from '@base-ui/react/dialog';
import type { DialogRootProps as PrimitiveRootProps } from '@base-ui/react/dialog';
import { cva, VariantProps } from 'cva';
import { createContext, use } from 'react';
import type { ComponentProps } from 'react';

import { styles as buttonStyles } from './button';

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
      'blur-md fixed inset-0 min-h-dvh bg-oatmeal-950 opacity-40 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
      // iOS 26+: Ensure the backdrop covers the entire visible viewport.
      'supports-[-webkit-touch-callout:none]:absolute',
    ],
  }),
  popup: cva({
    base: [
      'fixed w-96 max-w-[calc(100vw-3rem)]',
      'transition-all duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
      'surface rounded-3xl p-6',
    ],
    variants: {
      position: {
        center: [
          'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-8',
          'data-starting-style:scale-90 data-ending-style:scale-90',
        ],
        bottom: [
          'bottom-0 left-1/2 -translate-x-1/2 mb-4',
          'data-starting-style:translate-y-full data-ending-style:translate-y-full',
        ],
      },
    },
    defaultVariants: {
      position: 'center',
    },
  }),
  title: cva({
    base: 'text-base font-bold',
  }),
  description: cva({
    base: 'mt-1 text-sm text-gray-600',
  }),
  actions: cva({
    base: 'flex shrink-0 gap-3',
  }),
};

const DialogRoot = ({ children, modal, ...props }: PrimitiveRootProps) => (
  <DialogContext.Provider value={{ modal }}>
    <Primitive.Root {...props}>{children}</Primitive.Root>
  </DialogContext.Provider>
);

const DialogContent = ({
  children,
  position,
  ...props
}: ComponentProps<typeof Primitive.Popup> &
  VariantProps<typeof styles.popup>) => {
  const { modal } = useDialogContext();
  console.log(modal);
  return (
    <Primitive.Portal>
      {modal === true || modal === undefined ? (
        <Primitive.Backdrop className={styles.backdrop()} />
      ) : null}
      <Primitive.Popup {...props} className={styles.popup({ position })}>
        {children}
      </Primitive.Popup>
    </Primitive.Portal>
  );
};

const DialogTitle = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Title>) => (
  <Primitive.Title {...props} className={styles.title()}>
    {children}
  </Primitive.Title>
);

const DialogDescription = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Description>) => (
  <Primitive.Description {...props} className={styles.description()}>
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
