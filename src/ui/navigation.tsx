'use client';

import { Dialog } from '@base-ui/react/dialog';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import Link from 'fumadocs-core/link';
import { Cancel01Icon, Menu01Icon } from 'hugeicons-react';
import { usePathname } from 'next/navigation';

import { navItems } from '@/app.config';
import { cn } from '@/lib/styles.utils';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return href === '/' ? pathname === href : pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-gray-900"
        >
          MySite
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:block">
          <NavigationMenu.Root>
            <NavigationMenu.List className="flex gap-8">
              {navItems.map((item) => (
                <NavigationMenu.Item key={item.label}>
                  <NavigationMenu.Link
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-black',
                      isActive(item.href)
                        ? 'font-semibold text-black'
                        : 'text-gray-600'
                    )}
                  >
                    {item.label}
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ))}
            </NavigationMenu.List>
          </NavigationMenu.Root>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Dialog.Root>
            <Dialog.Trigger className="flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none">
              <Menu01Icon className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />

              <Dialog.Popup className="fixed inset-y-0 right-0 z-50 w-full max-w-xs border-l bg-white p-6 shadow-2xl transition-transform duration-300 focus:outline-none data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full sm:max-w-sm">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    MySite
                  </span>
                  <Dialog.Close className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none">
                    <Cancel01Icon className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Dialog.Close>
                </div>

                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'block rounded-md px-3 py-2 text-base font-medium transition-colors',
                        isActive(item.href)
                          ? 'bg-gray-100 text-black'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                      )}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </nav>
  );
}
