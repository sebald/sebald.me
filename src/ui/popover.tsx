'use client';

import { Popover as Primitive } from '@base-ui/react/popover';
import type { PopoverRootProps as PrimitiveRootProps } from '@base-ui/react/popover';
import { cva, VariantProps } from 'cva';
import { createContext, use } from 'react';
import type { ComponentProps } from 'react';

import { styles as buttonStyles } from './button';
import { style as headlineStyle } from './headline';
import { style as textStyle } from './text';

interface PopoverContextType {
  modal: PrimitiveRootProps['modal'];
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

export const usePopoverContext = () => {
  const context = use(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within Popover.Root');
  }
  return context;
};

export const styles = {
  trigger: buttonStyles,
  popup: cva({
    base: [
      'panel panel-opaque rounded-2xl px-4 py-3 grid',
      'z-100',
      'transition-all duration-150',
      'data-starting-style:opacity-0 data-ending-style:opacity-0',
      'data-starting-style:scale-90 data-ending-style:scale-90',
    ],
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

interface PopoverTriggerProps
  extends ComponentProps<typeof Primitive.Trigger>,
    VariantProps<typeof styles.trigger> {}

const PopoverTrigger = ({
  children,
  variant,
  ...props
}: PopoverTriggerProps) => (
  <Primitive.Trigger {...props} className={styles.trigger({ variant })}>
    {children}
  </Primitive.Trigger>
);

const PopoverPortal = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Portal>) => (
  <Primitive.Portal {...props}>{children}</Primitive.Portal>
);

const PopoverPositioner = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Positioner>) => (
  <Primitive.Positioner {...props}>{children}</Primitive.Positioner>
);

const PopoverPopup = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Popup>) => (
  <Primitive.Popup {...props} className={styles.popup()}>
    {children}
  </Primitive.Popup>
);

const PopoverTitle = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Title>) => (
  <Primitive.Title {...props} className={styles.title()}>
    {children}
  </Primitive.Title>
);

const PopoverDescription = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Description>) => (
  <Primitive.Description {...props} className={styles.description()}>
    {children}
  </Primitive.Description>
);

const PopoverArrow = ({
  children,
  ...props
}: ComponentProps<typeof Primitive.Arrow>) => (
  <Primitive.Arrow
    {...props}
    className="flex data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=right]:left-[-13px] data-[side=top]:bottom-[-8px] data-[side=left]:rotate-90 data-[side=right]:-rotate-90 data-[side=top]:rotate-180"
  >
    {children}
  </Primitive.Arrow>
);

export const Popover = Object.assign(PopoverPopup, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Arrow: PopoverArrow,
});
