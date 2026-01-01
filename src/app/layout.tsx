import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';

import '@/css/styles.css';
import { Analytics } from '@/ui/analytics/analytics';
import { Navigation } from '@/ui/navigation';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  alternates: {
    types: {
      'application/rss+xml': [
        {
          title: 'Sebastian Sebald',
          url: 'https://sebald.me/rss.xml',
        },
        {
          title: 'Sebastian Sebald - Articles',
          url: 'https://sebald.me/articles/rss.xml',
        },
        {
          title: 'Sebastian Sebald - Labs',
          url: 'https://sebald.me/labs/rss.xml',
        },
      ],
    },
  },
};

const Layout = async ({ children }: LayoutProps<'/'>) => (
  <html
    lang="en"
    className={`scrollbar scrollbar-thumb-oatmeal-800 scrollbar-track-transparent ${spaceMono.variable} ${plusJakarta.variable}`}
  >
    <body className="bg-oatmeal-50 text-oatmeal-950 relative isolate font-mono">
      <div className="grid min-h-screen grid-rows-[1fr_auto] justify-items-center">
        <Navigation />
        <main className="w-content pt-40">{children}</main>
        <footer>TODO</footer>
      </div>
      <Analytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? ''} />
    </body>
  </html>
);

export default Layout;
