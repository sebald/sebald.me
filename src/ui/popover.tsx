'use client';

import { Popover as Primitive } from '@base-ui/react/popover';
import type { PopoverRootProps as PrimitiveRootProps } from '@base-ui/react/popover';
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
      'panel rounded-2xl px-4 py-3 grid',
      'transition-all duration-150',
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
    },
    defaultVariants: {
      variant: 'clear',
    },
  }),
  title: cva({
    base: headlineStyle({ level: '5' }),
  }),
  description: cva({
    base: textStyle({ size: 'caption' }),
  }),
  body: cva({
    base: textStyle(),
  }),
};

interface PopoverRootProps extends PrimitiveRootProps {}

const PopoverRoot = ({ children, ...props }: PopoverRootProps) => (
  <PopoverContext.Provider value={{ modal: props.modal }}>
    <Primitive.Root {...props}>{children}</Primitive.Root>
  </PopoverContext.Provider>
);

type PopoverTriggerProps = Omit<
  ComponentProps<typeof Primitive.Trigger>,
  'className' | 'style'
>;

const PopoverTrigger = ({ children, ...props }: PopoverTriggerProps) => (
  <Primitive.Trigger {...props} className={styles.trigger()}>
    {children}
  </Primitive.Trigger>
);

interface PopoverContentProps
  extends Pick<
      ComponentProps<typeof Primitive.Positioner>,
      'align' | 'alignOffset' | 'side' | 'sideOffset'
    >,
    VariantProps<typeof styles.popup> {
  children: React.ReactNode;
}

const PopoverContent = ({
  children,
  sideOffset = 8,
  variant,
  ...positionerProps
}: PopoverContentProps) => {
  const { modal } = usePopoverContext();

  return (
    <Primitive.Portal>
      {modal === true ? (
        <Primitive.Backdrop className={styles.backdrop()} />
      ) : null}
      <Primitive.Positioner {...positionerProps} sideOffset={sideOffset}>
        <Primitive.Popup className={styles.popup({ variant })}>
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

const PopoverTitle = ({ children, ...props }: PopoverTitleProps) => (
  <Primitive.Title {...props} className={styles.title()}>
    {children}
  </Primitive.Title>
);

type PopoverDescriptionProps = Omit<
  ComponentProps<typeof Primitive.Description>,
  'className' | 'style'
>;

const PopoverDescription = ({
  children,
  ...props
}: PopoverDescriptionProps) => (
  <Primitive.Description {...props} className={styles.description()}>
    {children}
  </Primitive.Description>
);

export const Popover = Object.assign(PopoverContent, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Title: PopoverTitle,
  Description: PopoverDescription,
});
