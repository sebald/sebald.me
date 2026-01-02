'use client';

import { cva } from 'cva';
import Link from 'fumadocs-core/link';
import { usePathname } from 'next/navigation';

import { navItems } from '@/app.config';
import { cn } from '@/lib/styles.utils';

import { MenuIcon } from './icon/menu-icon';
import { Logo } from './logo';
import { Popover } from './popover';

const navItemStyles = cva({
  base: 'transition-color rounded-full font-medium',
  variants: {
    variant: {
      desktop: [
        'text-black-700',
        'weight-on-hover-semibold',
        'hover:text-black-900',
        'hover:underline underline-offset-4 decoration-2 decoration-oatmeal-600/30',
      ],
      mobile: ['text-lg text-oatmeal-200 hover:text-oatmeal-50'],
    },
  },
});

interface NavItemProps {
  href: string;
  label: string;
  variant: 'desktop' | 'mobile';
}

const NavItem = ({ href, label, variant }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={navItemStyles({ variant })}
      data-text={label}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </Link>
  );
};

const StaticNav = () => (
  <nav className="@navigation:flex hidden gap-12">
    {navItems.map((item) => (
      <NavItem
        key={item.label}
        href={item.href}
        label={item.label}
        variant="desktop"
      />
    ))}
  </nav>
);

const FloatingNav = () => (
  <div className="@navigation:hidden">
    <Popover.Root modal>
      <Popover.Trigger
        variant="icon"
        // className="flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        <MenuIcon size={24} />
      </Popover.Trigger>

      <Popover variant="opaque" align="end" sideOffset={16}>
        {/* <p className="text-oatmeal-400 mb-4 font-sans text-xs font-semibold uppercase tracking-widest">
          Navigation
        </p> */}
        <nav className="flex flex-col space-y-4">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              href={item.href}
              label={item.label}
              variant="mobile"
            />
          ))}
        </nav>
      </Popover>
    </Popover.Root>
  </div>
);

export const Navigation = () => (
  <nav
    className={cn(
      '@container',
      'flex w-full items-center justify-between',
      'z-100 fixed left-1/2 top-0 -translate-x-1/2',
      'transition-all',
      'animate-floating-nav scroll-trigger scroll-trigger-to-25',
      'lg:max-w-content px-4 py-3 lg:px-0',
    )}
  >
    <Logo
      className="animate-shrink shrink-scale-75 scroll-trigger scroll-trigger-to-25"
      href="/"
    />
    <StaticNav />
    <FloatingNav />
  </nav>
);
