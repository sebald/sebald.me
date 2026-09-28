'use client';

import {
  DotsThreeVerticalIcon,
  LinkSimpleIcon,
} from '@phosphor-icons/react/ssr';
import type { Route } from 'next';
import NextLink from 'next/link';
import type { AriaAttributes, PropsWithChildren } from 'react';

import type { SimpleAnalyticsEventName } from '@/lib/analytics';
import { trackEvent } from '@/lib/analytics';
import { Menu } from '@/ui/menu';
import { toast } from '@/ui/toast';

// ActionMenu
// ---------------
interface ActionMenuProps extends PropsWithChildren, AriaAttributes {
  label?: string;
}

export const ActionMenu = ({
  children,
  label = 'Actions',
  ...ariaProps
}: ActionMenuProps) => (
  <Menu.Root>
    <Menu.Trigger variant="icon" aria-label={label} {...ariaProps}>
      <DotsThreeVerticalIcon weight="bold" aria-hidden />
    </Menu.Trigger>
    <Menu align="end">{children}</Menu>
  </Menu.Root>
);

// ActionMenuItem
// ---------------
interface ActionMenuItemProps extends PropsWithChildren, AriaAttributes {
  href?: string;
  onClick?: () => void;
  /**
   * Analytics event to track on click, a name so it can be set from
   * server components
   */
  event?: SimpleAnalyticsEventName;
}

export const ActionMenuItem = ({
  children,
  href,
  onClick,
  event,
  ...ariaProps
}: ActionMenuItemProps) => {
  const handleClick = () => {
    if (event) trackEvent(event);
    onClick?.();
  };

  if (href) {
    return (
      // Close on click, the menu would otherwise stay open after a
      // client-side navigation
      <Menu.LinkItem
        render={<NextLink href={href as Route} />}
        closeOnClick
        onClick={handleClick}
        {...ariaProps}
      >
        {children}
      </Menu.LinkItem>
    );
  }

  return (
    <Menu.Item onClick={handleClick} {...ariaProps}>
      {children}
    </Menu.Item>
  );
};

// CopyLinkItem
// ---------------
export const CopyLinkItem = () => {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.add({ title: 'Link copied' });
      trackEvent('Copy', { target: 'url' });
    } catch {
      toast.add({ title: 'Could not copy the link', type: 'error' });
    }
  };

  return (
    <ActionMenuItem onClick={copyLink}>
      <LinkSimpleIcon weight="bold" aria-hidden />
      Copy URL
    </ActionMenuItem>
  );
};
