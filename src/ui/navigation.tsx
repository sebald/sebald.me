'use client';

import type { LinkProps } from 'fumadocs-core/link';
import Link from 'fumadocs-core/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { useResizeObserver } from 'usehooks-ts';

import { navItems } from '@/app.config';
import { cn } from '@/lib/styles.utils';

import { Headline } from './headline';
import { MenuIcon } from './icon/menu-icon';
import { Logo } from './logo';
import { Popover } from './popover';

// Nav Item (set aria-current if active))
// ---------------
const NavItem = ({ children, ...props }: LinkProps) => {
  const pathname = usePathname();
  const isActive = props.href
    ? props.href === '/'
      ? pathname === props.href
      : pathname.startsWith(props.href)
    : undefined;

  return (
    <Link {...props} aria-current={isActive ? 'page' : undefined}>
      {children}
    </Link>
  );
};

// Static (large screens, scrolled top)
// ---------------
const StaticNav = () => (
  <nav className="@navigation:flex hidden gap-12">
    {navItems.map(item => (
      <NavItem
        key={item.title}
        href={item.href}
        data-text={item.title}
        className={cn(
          'text-black-700 transition-color rounded-full font-medium',
          'decoration-oatmeal-600/30 decoration-2 underline-offset-4',
          'hover:text-black-900 weight-on-hover-semibold hover:underline',
        )}
      >
        {item.title}
      </NavItem>
    ))}
  </nav>
);

// Small screens, scrolled
// ---------------
const FloatingNav = () => {
  const popupHandler = Popover.createHandle();

  /**
   * Hide the popup when the fluid nav would be hidden because the browser window is resized.
   * Also helps triggereing the resize observer only when nav is shown or hidden.
   */
  const ref = useRef<HTMLDivElement>(null!);
  useResizeObserver({
    ref,
    onResize: ({ width }) => {
      if (width === 0 && popupHandler.isOpen) {
        popupHandler.close();
      }
    },
  });

  return (
    <div ref={ref} className="@navigation:hidden">
      <Popover.Root modal handle={popupHandler}>
        <Popover.Trigger variant="icon" aria-label="Open navigation menu">
          <MenuIcon size={24} />
        </Popover.Trigger>

        <Popover
          variant="clear"
          stretch="navigation"
          inset="tight"
          align="end"
          alignOffset={-22}
          sideOffset={16}
          collisionPadding={16}
        >
          <nav className="grid grid-cols-[min-content_1fr]">
            {navItems.map(item => {
              const Icon = item.Icon;
              return (
                <NavItem
                  key={item.title}
                  href={item.href}
                  className={cn(
                    'group',
                    'col-span-full grid grid-cols-subgrid gap-4',
                    'hover:bg-black-500/15 rounded-xl',
                    'px-6 py-4',
                  )}
                >
                  <div
                    className={cn(
                      'grid place-items-center',
                      'text-black-500',
                      'group-hover:text-link-hover',
                    )}
                  >
                    <Icon size={32} weight="duotone" />
                  </div>
                  <div>
                    <Headline level="5">{item.title}</Headline>
                    <div className="text-black-600 font-sans text-sm leading-snug">
                      {item.description}
                    </div>
                  </div>
                </NavItem>
              );
            })}
          </nav>
        </Popover>
      </Popover.Root>
    </div>
  );
};

// Component
// ---------------
export const Navigation = () => (
  <nav
    className={cn(
      '@container',
      'flex w-full items-center justify-between',
      'z-90 fixed left-1/2 top-0 -translate-x-1/2',
      'transition-all',
      'animate-floating-nav scroll-trigger scroll-trigger-to-25',
      'lg:max-w-content px-4 py-3 lg:px-0',
    )}
  >
    <Logo
      className="animate-shrink shrink-scale-90 scroll-trigger scroll-trigger-to-25 @navigation:shrink-scale-80"
      href="/"
    />
    <StaticNav />
    <FloatingNav />
  </nav>
);
