'use client';

import {
  DotsThreeVerticalIcon,
  LinkSimpleIcon,
} from '@phosphor-icons/react/ssr';
import type { Route } from 'next';
import NextLink from 'next/link';
import type { AriaAttributes, PropsWithChildren } from 'react';

import {
  MenuItem,
  MenuPopup,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from '@/ui/menu';

// ActionMenu
// ---------------
interface ActionMenuProps extends PropsWithChildren, AriaAttributes {}

export const ActionMenu = ({ children, ...ariaProps }: ActionMenuProps) => (
  <MenuRoot>
    <MenuTrigger variant="icon" aria-label="Article actions" {...ariaProps}>
      <DotsThreeVerticalIcon weight="bold" />
    </MenuTrigger>
    <MenuPopup align="end">{children}</MenuPopup>
  </MenuRoot>
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
      <MenuItem render={<NextLink href={href as Route} />} {...ariaProps}>
        {children}
      </MenuItem>
    );
  }

  return (
    <MenuItem onClick={onClick} {...ariaProps}>
      {children}
    </MenuItem>
  );
};

// ActionMenuSeparator
// ---------------
export const ActionMenuSeparator = () => <MenuSeparator />;

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
