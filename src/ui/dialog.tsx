'use client';

import { Dialog as Primitive } from '@base-ui/react/dialog';
import type { DialogRootProps as PrimitiveRootProps } from '@base-ui/react/dialog';
import { XIcon } from '@phosphor-icons/react/ssr';
import { cva, VariantProps } from 'cva';
import { createContext, use } from 'react';
import type { ComponentProps } from 'react';

import { styles as buttonStyles } from './button';
import { style as headlineStyle } from './headline';
import { style as textStyle } from './text';

interface DialogContextType {
  modal: PrimitiveRootProps['modal'];
}

const DialogContext = createContext<DialogContextType | null>(null);

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
    ],
    variants: {
      position: {
        center: [
          'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-8',
          'transition-all duration-150 data-starting-style:scale-90 data-ending-style:scale-90',
        ],
        top: [
          'top-0 left-1/2 -translate-x-1/2 mt-4',
          'data-starting-style:-translate-y-full data-ending-style:-translate-y-full',
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
  content: cva({
    base: ['panel panel-opaque rounded-3xl p-6', 'grid'],
    variants: {
      layout: {
        stack: [
          'grid-cols-1',
          '[grid-template-areas:"title""description""body""actions"]',
        ],
        inline: [
          'grid-cols-1 md:grid-cols-[1fr_auto] md:gap-x-6',
          '[grid-template-areas:"title""description""body""actions"]',
          'md:[grid-template-areas:"title_actions""description_actions""body_actions"]',
        ],
      },
    },
    defaultVariants: {
      layout: 'stack',
    },
  }),
  title: cva({
    base: `${headlineStyle({ level: '4' })} [grid-area:title]`,
  }),
  description: cva({
    base: `${textStyle({ size: 'caption' })} [grid-area:description]`,
  }),
  body: cva({
    base: `${textStyle()} [grid-area:body] mt-6`,
  }),
  actions: cva({
    base: 'flex shrink-0 gap-3 [grid-area:actions] mt-6 justify-end self-end',
  }),
};

export interface DialogContentProps
  extends ComponentProps<typeof Primitive.Popup>,
    VariantProps<typeof styles.popup>,
    VariantProps<typeof styles.content> {
  showCloseButton?: boolean;
}

const DialogRoot = ({ children, ...props }: PrimitiveRootProps) => (
  <DialogContext.Provider value={{ modal: props.modal }}>
    <Primitive.Root {...props}>{children}</Primitive.Root>
  </DialogContext.Provider>
);

const DialogContent = ({
  children,
  position,
  size,
  layout,
  showCloseButton,
  ...props
}: DialogContentProps) => {
  const { modal } = useDialogContext();

  return (
    <DialogContext.Provider value={{ modal }}>
      <Primitive.Portal>
        {modal === true || modal === undefined ? (
          <Primitive.Backdrop className={styles.backdrop()} />
        ) : null}
        <Primitive.Popup
          {...props}
          className={styles.popup({ position, size })}
        >
          <div className={`relative ${styles.content({ layout })}`}>
            {showCloseButton && (
              <Primitive.Close
                className={buttonStyles({
                  variant: 'icon',
                  className: 'absolute right-3 top-2.5',
                })}
              >
                <XIcon size={20} weight="regular" />
              </Primitive.Close>
            )}
            {children}
          </div>
        </Primitive.Popup>
      </Primitive.Portal>
    </DialogContext.Provider>
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

const DialogBody = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={styles.body()}>
    {children}
  </div>
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
  Body: DialogBody,
  Actions: DialogActions,
  Trigger: DialogTrigger,
  Close: DialogClose,
});
