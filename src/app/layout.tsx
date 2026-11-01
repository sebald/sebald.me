import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';

import { siteDescription, siteUrl } from '@/app.config';
import { fontMono } from '@/css/fonts';
import { openGraphDefaults, twitterDefaults } from '@/lib/og';
import '@/css/styles.css';
import { Footer } from '@/ui/layout/footer';
import { Toaster } from '@/ui/toast';
import { OutboundLinkTracking } from '@/ui/tracking/outbound-link-tracking';

// Meta
// ---------------
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sebastian Sebald',
    template: '%s | Sebastian Sebald',
  },
  description: siteDescription,
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
        {
          title: 'Sebastian Sebald, read aloud',
          url: 'https://sebald.me/audio.xml',
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
    {/* Room for the docked narration player, so it doesn't cover the footer */}
    <body className="relative isolate has-[>[data-narration-bar]]:pb-28">
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
