'use client';

import { Popover as Primitive } from '@base-ui/react/popover';
import type { PopoverRootProps as PrimitiveRootProps } from '@base-ui/react/popover';
import { XIcon } from '@phosphor-icons/react/ssr';
import { cva, VariantProps } from 'cva';
import { createContext, use } from 'react';
import type { ComponentProps } from 'react';

import { styles as buttonStyles } from './button';
import { style as headlineStyle } from './headline';
import { style as textStyle } from './text';

interface PopoverContextType extends Pick<PrimitiveRootProps, 'modal'> {}

const PopoverContext = createContext<PopoverContextType | null>(null);

export const usePopoverContext = () => {
  const context = use(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within Popover.Root');
  }
  return context;
};

export const styles = {
  trigger: buttonStyles,
  backdrop: cva({
    base: [
      'backdrop-blur-xs fixed inset-0 min-h-dvh bg-white/40',
      'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0',
      // iOS 26+: Ensure the backdrop covers the entire visible viewport.
      'supports-[-webkit-touch-callout:none]:absolute',
    ],
  }),
  popup: cva({
    base: [
      'panel rounded-2xl grid',
      'transition-[opacity,scale] duration-200',
      'data-starting-style:opacity-0 data-ending-style:opacity-0',
      'data-starting-style:scale-90 data-ending-style:scale-90',
    ],
    variants: {
      variant: {
        clear: 'panel-clear',
        ghost: 'panel-ghost',
        tinted: 'panel-tinted',
        dark: 'panel-dark',
        opaque: 'panel-opaque',
      },
      stretch: {
        content: '',
        navigation:
          'w-[min(var(--available-width),var(--container-navigation))]',
      },
      inset: {
        default: 'p-6',
        relaxed: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'clear',
      stretch: 'content',
      inset: 'default',
    },
  }),
  title: cva({
    base: headlineStyle({ level: '5' }),
  }),
  description: cva({
    base: textStyle({ size: 'caption' }),
  }),
  body: cva({
    base: `${textStyle()} mt-4`,
  }),
};

interface PopoverRootProps extends PrimitiveRootProps {}

const Root = ({ children, ...props }: PopoverRootProps) => (
  <PopoverContext.Provider value={{ modal: props.modal }}>
    <Primitive.Root {...props}>{children}</Primitive.Root>
  </PopoverContext.Provider>
);

export interface PopoverTriggerProps
  extends Omit<ComponentProps<typeof Primitive.Trigger>, 'className' | 'style'>,
    VariantProps<typeof styles.trigger> {}

const Trigger = ({ children, variant, ...props }: PopoverTriggerProps) => (
  <Primitive.Trigger {...props} className={styles.trigger({ variant })}>
    {children}
  </Primitive.Trigger>
);

interface PopoverContentProps
  extends Pick<
      ComponentProps<typeof Primitive.Positioner>,
      'align' | 'alignOffset' | 'side' | 'sideOffset' | 'collisionPadding'
    >,
    VariantProps<typeof styles.popup> {
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const Content = ({
  children,
  sideOffset = 8,
  variant,
  stretch,
  inset,
  showCloseButton,
  ...positionerProps
}: PopoverContentProps) => {
  const { modal } = usePopoverContext();

  return (
    <Primitive.Portal>
      {modal === true ? (
        <Primitive.Backdrop className={styles.backdrop()} />
      ) : null}
      <Primitive.Positioner
        className="z-100"
        sideOffset={sideOffset}
        {...positionerProps}
      >
        <Primitive.Popup className={styles.popup({ variant, stretch, inset })}>
          {showCloseButton && (
            <Primitive.Close
              className={buttonStyles({
                variant: 'icon',
                className: 'absolute right-2 top-2',
              })}
            >
              <XIcon size={20} weight="regular" />
            </Primitive.Close>
          )}
          {children}
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
};

type PopoverTitleProps = Omit<
  ComponentProps<typeof Primitive.Title>,
  'className' | 'style'
>;

const Title = ({ children, ...props }: PopoverTitleProps) => (
  <Primitive.Title {...props} className={styles.title()}>
    {children}
  </Primitive.Title>
);

type PopoverDescriptionProps = Omit<
  ComponentProps<typeof Primitive.Description>,
  'className' | 'style'
>;

const Description = ({ children, ...props }: PopoverDescriptionProps) => (
  <Primitive.Description {...props} className={styles.description()}>
    {children}
  </Primitive.Description>
);

const Body = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={styles.body()}>
    {children}
  </div>
);

export const Popover = Object.assign(Content, {
  Root: Root,
  Trigger: Trigger,
  Title: Title,
  Description: Description,
  Body: Body,
  createHandle: Primitive.createHandle,
});
