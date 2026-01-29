'use client';

import {
  DotsThreeVerticalIcon,
  LinkSimpleIcon,
} from '@phosphor-icons/react/ssr';
import type { Route } from 'next';
import NextLink from 'next/link';
import type { AriaAttributes, PropsWithChildren } from 'react';

import { Menu } from '@/ui/menu';

// ActionMenu
// ---------------
interface ActionMenuProps extends PropsWithChildren, AriaAttributes {}

export const ActionMenu = ({ children, ...ariaProps }: ActionMenuProps) => (
  <Menu.Root>
    <Menu.Trigger variant="icon" aria-label="Article actions" {...ariaProps}>
      <DotsThreeVerticalIcon weight="bold" />
    </Menu.Trigger>
    <Menu align="end">{children}</Menu>
  </Menu.Root>
);

// ActionMenuItem
// ---------------
interface ActionMenuItemProps extends PropsWithChildren, AriaAttributes {
  href?: string;
  onClick?: () => void;
}

export const ActionMenuItem = ({
  children,
  href,
  onClick,
  ...ariaProps
}: ActionMenuItemProps) => {
  if (href) {
    return (
      <Menu.Item render={<NextLink href={href as Route} />} {...ariaProps}>
        {children}
      </Menu.Item>
    );
  }

  return (
    <Menu.Item onClick={onClick} {...ariaProps}>
      {children}
    </Menu.Item>
  );
};

// ActionMenuSeparator
// ---------------
export const ActionMenuSeparator = () => <Menu.Separator />;

// CopyLinkItem
// ---------------
export const CopyLinkItem = () => {
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <ActionMenuItem onClick={copyLink}>
      <LinkSimpleIcon weight="bold" />
      Copy URL
    </ActionMenuItem>
  );
};
