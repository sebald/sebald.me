import type { Route } from 'next';

export type NavItem = {
  label: string;
  href: Route;
};

export const navItems: NavItem[] = [
  { label: 'Articles', href: '/articles' },
  { label: 'Labs', href: '/labs' },
  { label: 'About', href: '/about' },
];
