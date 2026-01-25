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
        <div className="">
          {/* <Navigation /> */}
          <main className="w-content mx-auto">{children}</main>
          <Footer />
        </div>
        <Analytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? ''} />
      </AnalyticsProvider>
    </body>
  </html>
);

export default Layout;
