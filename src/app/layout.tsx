import type { Metadata } from 'next';

import { siteUrl } from '@/app.config';
import { fontMono } from '@/css/fonts';
import '@/css/styles.css';
import { Analytics } from '@/ui/analytics/analytics';
import { AnalyticsProvider } from '@/ui/analytics/analytics-context';
import { Footer } from '@/ui/layout/footer';

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
    images: ['/og.png'],
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
    className={`bg-background text-foreground font-mono ${fontMono.variable}`}
    suppressHydrationWarning
  >
    <body className="relative isolate">
      <AnalyticsProvider>
        <div className="px-content-padding w-content mx-auto">
          <main>{children}</main>
          <Footer />
        </div>
        <Analytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? ''} />
      </AnalyticsProvider>
    </body>
  </html>
);

export default Layout;
