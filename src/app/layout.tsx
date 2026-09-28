import type { Metadata } from 'next';

import { gaId, siteUrl } from '@/app.config';
import { fontMono } from '@/css/fonts';
import '@/css/styles.css';
import { Analytics } from '@/ui/analytics/analytics';
import { AnalyticsProvider } from '@/ui/analytics/analytics-context';
import { Footer } from '@/ui/layout/footer';
import { Toaster } from '@/ui/toast';

// Meta
// ---------------
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Welcome',
    template: '%s | Sebastian Sebald',
  },
  description:
    'Personal blog by Sebastian Sebald. Notes on web development, design systems, and creative coding.',
  authors: [{ name: 'Sebastian Sebald', url: siteUrl }],
  creator: 'Sebastian Sebald',
  openGraph: {
    siteName: 'Sebastian Sebald',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@sebastiansebald',
  },
  alternates: {
    types: {
      'application/rss+xml': [
        {
          title: 'Sebastian Sebald',
          url: 'https://sebald.me/rss.xml',
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
    className={`bg-background font-mono text-foreground ${fontMono.variable}`}
    suppressHydrationWarning
  >
    <body className="relative isolate">
      <AnalyticsProvider>
        <Toaster>
          <div className="mx-auto w-content px-content-padding">
            <main>{children}</main>
            <Footer />
          </div>
          {gaId && <Analytics gaId={gaId} />}
        </Toaster>
      </AnalyticsProvider>
    </body>
  </html>
);

export default Layout;
