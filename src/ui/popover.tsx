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

type PopoverTriggerProps = Omit<
  ComponentProps<typeof Primitive.Trigger>,
  'className' | 'style'
>;

const PopoverTrigger = ({ children, ...props }: PopoverTriggerProps) => (
  <Primitive.Trigger {...props} className={styles.trigger()}>
    {children}
  </Primitive.Trigger>
);

type PopoverContentProps = Omit<
  ComponentProps<typeof Primitive.Positioner>,
  'className' | 'style'
> & {
  children: React.ReactNode;
};

const PopoverContent = ({
  children,
  sideOffset = 8,
  ...positionerProps
}: PopoverContentProps) => {
  const { modal } = usePopoverContext();

  return (
    <PopoverContext.Provider value={{ modal }}>
      <Primitive.Portal>
        <Primitive.Positioner {...positionerProps} sideOffset={sideOffset}>
          <Primitive.Popup className={styles.popup()}>
            {children}
          </Primitive.Popup>
        </Primitive.Positioner>
      </Primitive.Portal>
    </PopoverContext.Provider>
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
