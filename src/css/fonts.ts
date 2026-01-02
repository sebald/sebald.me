import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';

export const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
