import type { Metadata } from 'next';

import { siteUrl } from '@/app.config';
import { plusJakarta, spaceMono } from '@/css/fonts';
import '@/css/styles.css';
import { Analytics } from '@/ui/analytics/analytics';
import { AnalyticsProvider } from '@/ui/analytics/analytics-context';
import { Footer } from '@/ui/layout/footer';
import { Navigation } from '@/ui/layout/navigation';

// Meta
// ---------------
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Welcome',
    template: '%s | Sebastian Sebald',
  },
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
          title: 'Sebastian Sebald - Lab',
          url: 'https://sebald.me/lab/rss.xml',
        },
      ],
    },
  },
};

// Layout
// ---------------
const Layout = async ({ children }: LayoutProps<'/'>) => (
  <html
    lang="en"
    className={`scrollbar scrollbar-thumb-oatmeal-800 scrollbar-track-transparent ${spaceMono.variable} ${plusJakarta.variable}`}
    suppressHydrationWarning
  >
    <body className="bg-oatmeal-50 text-text relative isolate font-mono">
      <AnalyticsProvider>
        <div className="grid min-h-screen grid-rows-[1fr_auto] justify-items-center">
          <Navigation />
          <main className="w-content pt-32 md:pt-40">{children}</main>
          <Footer />
        </div>
        <Analytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? ''} />
      </AnalyticsProvider>
    </body>
  </html>
);

export default Layout;
