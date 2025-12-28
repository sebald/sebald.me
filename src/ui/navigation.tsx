'use client';

import { ListIcon } from '@phosphor-icons/react/ssr';
import { cva } from 'cva';
import Link from 'fumadocs-core/link';
import { usePathname } from 'next/navigation';

import { navItems } from '@/app.config';
import { cn } from '@/lib/styles.utils';

import { Dialog } from './dialog';
import { Logo } from './logo';

const navItemStyles = cva({
  base: 'transition-colors rounded-full font-medium',
  variants: {
    variant: {
      desktop: ['text-oatmeal-700', 'hover:bg-oatmeal-100', 'px-8 py-2'],
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
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </Link>
  );
};

const LargeScreenNav = () => (
  <nav className="@navigation:flex hidden">
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

const SmallScreenNav = () => (
  <div className="@navigation:hidden">
    <Dialog.Root>
      <Dialog.Trigger
        variant="icon"
        className="flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        <ListIcon size={24} weight="regular" />
      </Dialog.Trigger>

      <Dialog position="bottom" size="full" showCloseButton>
        <p className="text-oatmeal-400 mb-2 font-sans text-xs font-semibold uppercase tracking-widest">
          Navigation
        </p>
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
      </Dialog>
    </Dialog.Root>
  </div>
);

export const Navigation = () => (
  <nav
    className={cn(
      '@container',
      'flex w-full items-center justify-between',
      'fixed left-1/2 top-0 z-50 -translate-x-1/2',
      'transition-all',
      'animate-floating-nav scroll-trigger scroll-trigger-to-25',
      'lg:max-w-content max-w-5xl px-4 py-3 lg:px-0',
    )}
  >
    <Logo
      className="animate-shrink shrink-scale-75 scroll-trigger scroll-trigger-to-25"
      href="/"
    />
    <LargeScreenNav />
    <SmallScreenNav />
  </nav>
);
