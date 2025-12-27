'use client';

import { Dialog } from '@base-ui/react/dialog';
import { ListIcon, X } from '@phosphor-icons/react/ssr';
import { cva } from 'cva';
import Link from 'fumadocs-core/link';
import { usePathname } from 'next/navigation';

import { navItems } from '@/app.config';
import { cn } from '@/lib/styles.utils';

import { Logo } from './logo';

const navItemStyles = cva({
  base: 'transition-colors',
  variants: {
    variant: {
      desktop: 'font-medium text-oatmeal-800 hover:font-semibold',
      mobile:
        'block rounded-md px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-black',
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

const SmallScreenNav = () => (
  <div className="@navigation:hidden">
    <Dialog.Root>
      <Dialog.Trigger
        className="flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
        aria-label="Open navigation menu"
      >
        <ListIcon size={24} weight="regular" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />

        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 w-full max-w-xs border-l bg-white p-6 shadow-2xl transition-transform duration-300 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full sm:max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">MySite</span>
            <Dialog.Close
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close navigation menu"
            >
              <X size={20} weight="regular" />
            </Dialog.Close>
          </div>

          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                href={item.href}
                label={item.label}
                variant="mobile"
              />
            ))}
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
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
