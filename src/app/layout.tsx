import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';

import { siteUrl } from '@/app.config';
import { fontMono } from '@/css/fonts';
import { openGraphDefaults, twitterDefaults } from '@/lib/og';
import '@/css/styles.css';
import { Footer } from '@/ui/layout/footer';
import { OutboundLinkTracking } from '@/ui/outbound-link-tracking';
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
    ...openGraphDefaults,
    type: 'website',
  },
  twitter: twitterDefaults,
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
      <Toaster>
        <div className="mx-auto w-content px-content-padding">
          <main>{children}</main>
          <Footer />
        </div>
      </Toaster>
      <Analytics />
      <OutboundLinkTracking />
    </body>
  </html>
);

export default Layout;
