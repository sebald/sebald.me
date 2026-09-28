'use client';

import { Dialog as Primitive } from '@base-ui/react/dialog';
import type { DialogRootProps as PrimitiveRootProps } from '@base-ui/react/dialog';
import { XIcon } from '@phosphor-icons/react/ssr';
import { createContext, use } from 'react';
import type { ComponentProps } from 'react';

import type { VariantProps } from '@/lib/styles.utils';
import { cn, cva, mergeClassName } from '@/lib/styles.utils';

import { styles as buttonStyles } from './button';
import { styles as cardStyles } from './card';
import { style as headlineStyle } from './headline';
import { style as textStyle } from './text';

// Styles
// ---------------
export const styles = {
  trigger: buttonStyles,
  backdrop: cva({
    base: [
      'backdrop-blur-xs fixed inset-0 min-h-dvh bg-mist-900/50',
      'z-100',
      'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
      // iOS 26+: Ensure the backdrop covers the entire visible viewport.
      'supports-[-webkit-touch-callout:none]:absolute',
    ],
  }),
  viewport: cva({
    base: [
      'z-100',
      // Scroll container for dialogs taller than the viewport
      'fixed inset-0 flex items-start justify-center overflow-y-auto py-4',
      // Let clicks pass through to the page (non-modal dialogs)
      'pointer-events-none',
    ],
    variants: {
      position: {
        // Extra bottom space lifts centered dialogs slightly above the middle
        center: 'pb-20',
        top: '',
        bottom: '',
      },
    },
    defaultVariants: {
      position: 'center',
    },
  }),
  popup: cva({
    base: [
      'pointer-events-auto',
      'relative max-w-[calc(100vw-2rem)] px-4',
      'transition-all duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
    ],
    variants: {
      position: {
        // Auto margins (not `items-center`) so a popup taller than the
        // viewport is not clipped at the top and stays scrollable
        center: [
          'my-auto',
          'data-starting-style:scale-90 data-ending-style:scale-90',
        ],
        top: [
          'data-starting-style:-translate-y-full data-ending-style:-translate-y-full',
        ],
        bottom: [
          'mt-auto',
          'data-starting-style:translate-y-full data-ending-style:translate-y-full',
        ],
      },
      size: {
        small: 'w-sm',
        medium: 'w-md',
        large: 'w-2xl',
        xlarge: 'w-4xl',
        full: 'w-full',
      },
    },
    defaultVariants: {
      position: 'center',
      size: 'medium',
    },
  }),
  content: cva({
    composes: cardStyles,
    base: ['grid'],
    variants: {
      layout: {
        stack: [
          'grid-cols-1',
          '[grid-template-areas:"title""description""body""actions"]',
        ],
        inline: [
          'grid-cols-1 md:grid-cols-[1fr_auto] md:gap-x-12',
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
    base: `${headlineStyle({ level: '1' })} [grid-area:title]`,
  }),
  description: cva({
    base: `${textStyle()} [grid-area:description] mt-6`,
  }),
  body: cva({
    base: `${textStyle()} [grid-area:body] mt-6 grid gap-4`,
  }),
  actions: cva({
    base: [
      'flex shrink-0 gap-3 [grid-area:actions] mt-6',
      'flex-col',
      'md:flex-row-reverse md:justify-start md:self-end',
    ],
  }),
};

// Context
// ---------------
// Base UI renders the backdrop regardless of `modal`, so the popup needs to
// know whether to render one. Defaults to `true`, same as Base UI.
const ModalContext = createContext<PrimitiveRootProps['modal']>(true);

// Dialog.Root
// ---------------
const DialogRoot = ({
  children,
  modal = true,
  ...props
}: PrimitiveRootProps) => (
  <ModalContext.Provider value={modal}>
    <Primitive.Root {...props} modal={modal}>
      {children}
    </Primitive.Root>
  </ModalContext.Provider>
);

// Dialog
// ---------------
export interface DialogContentProps
  extends
    ComponentProps<typeof Primitive.Popup>,
    VariantProps<typeof styles.popup>,
    VariantProps<typeof styles.content> {
  showCloseButton?: boolean;
  /**
   * Accessible name of the close button (it only shows an icon)
   */
  closeLabel?: string;
}

const DialogContent = ({
  children,
  position,
  size,
  layout,
  showCloseButton,
  closeLabel = 'Close',
  className,
  ...props
}: DialogContentProps) => {
  const modal = use(ModalContext);

  return (
    <Primitive.Portal>
      {modal === true && <Primitive.Backdrop className={styles.backdrop()} />}
      <Primitive.Viewport className={styles.viewport({ position })}>
        <Primitive.Popup
          {...props}
          className={mergeClassName(
            styles.popup({ position, size }),
            className,
          )}
        >
          <div className={cn('relative', styles.content({ layout }))}>
            {showCloseButton && (
              <Primitive.Close
                aria-label={closeLabel}
                className={buttonStyles({
                  variant: 'icon',
                  className: 'absolute top-3 right-3',
                })}
              >
                <XIcon size={20} weight="regular" aria-hidden />
              </Primitive.Close>
            )}
            {children}
          </div>
        </Primitive.Popup>
      </Primitive.Viewport>
    </Primitive.Portal>
  );
};

// Dialog.Title
// ---------------
const DialogTitle = ({
  children,
  className,
  ...props
}: ComponentProps<typeof Primitive.Title>) => (
  <Primitive.Title
    {...props}
    className={mergeClassName(styles.title(), className)}
  >
    {children}
  </Primitive.Title>
);

// Dialog.Description
// ---------------
const DialogDescription = ({
  children,
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) => (
  <Primitive.Description
    {...props}
    className={mergeClassName(styles.description(), className)}
  >
    {children}
  </Primitive.Description>
);

// Dialog.Body
// ---------------
const DialogBody = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={styles.body({ className })}>
    {children}
  </div>
);

// Dialog.Actions
// ---------------
const DialogActions = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={styles.actions({ className })}>
    {children}
  </div>
);

// Dialog.Trigger
// ---------------
export interface DialogTriggerProps
  extends
    ComponentProps<typeof Primitive.Trigger>,
    VariantProps<typeof styles.trigger> {}

const DialogTrigger = ({
  children,
  variant,
  className,
  ...props
}: DialogTriggerProps) => (
  <Primitive.Trigger
    {...props}
    className={mergeClassName(styles.trigger({ variant }), className)}
  >
    {children}
  </Primitive.Trigger>
);

// Dialog.Close
// ---------------
export interface DialogCloseProps
  extends
    ComponentProps<typeof Primitive.Close>,
    VariantProps<typeof buttonStyles> {}

const DialogClose = ({
  children,
  variant = 'secondary',
  className,
  ...props
}: DialogCloseProps) => (
  <Primitive.Close
    {...props}
    className={mergeClassName(buttonStyles({ variant }), className)}
  >
    {children}
  </Primitive.Close>
);

// Dialog API
// ---------------
export const Dialog = Object.assign(DialogContent, {
  Root: DialogRoot,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Actions: DialogActions,
  Trigger: DialogTrigger,
  Close: DialogClose,
  createHandle: Primitive.createHandle,
});
