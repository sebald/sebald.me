import { IBM_Plex_Mono } from 'next/font/google';

export const fontMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});
