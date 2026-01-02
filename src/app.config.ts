import type { Route } from 'next';

export type NavItem = {
  label: string;
  href: Route;
};

export const navItems: NavItem[] = [
  { label: 'Articles', href: '/articles' },
  { label: 'Lab', href: '/lab' },
  { label: 'About', href: '/about' },
];
