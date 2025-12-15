'use client';

import { Dialog } from '@base-ui/react/dialog';
import { cva } from 'cva';
import Link from 'fumadocs-core/link';
import { Cancel01Icon, Menu01Icon } from 'hugeicons-react';
import { usePathname } from 'next/navigation';

import { navItems } from '@/app.config';

import { Logo } from './logo';

const navItemStyles = cva({
  base: 'transition-colors',
  variants: {
    variant: {
      desktop: 'text-sm font-medium hover:text-black',
      mobile:
        'block rounded-md px-3 py-2 text-base font-medium hover:bg-gray-50 hover:text-black',
    },
    active: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'desktop',
      active: true,
      className: 'font-semibold text-black',
    },
    {
      variant: 'desktop',
      active: false,
      className: 'text-gray-600',
    },
    {
      variant: 'mobile',
      active: true,
      className: 'bg-gray-100 text-black',
    },
    {
      variant: 'mobile',
      active: false,
      className: 'text-gray-700',
    },
  ],
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
      className={navItemStyles({ variant, active: isActive })}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </Link>
  );
};

const LargeScreenNav = () => (
  <nav className="hidden gap-8 md:flex">
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
  <div className="md:hidden">
    <Dialog.Root>
      <Dialog.Trigger
        className="flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
        aria-label="Open navigation menu"
      >
        <Menu01Icon className="size-6" />
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
              <Cancel01Icon className="h-5 w-5" />
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
  <nav className="w-fullbackdrop-blur-md sticky top-0 z-50">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
      <Logo href="/" />

      <LargeScreenNav />
      <SmallScreenNav />
    </div>
  </nav>
);
