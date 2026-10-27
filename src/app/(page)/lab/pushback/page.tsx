import type { Metadata } from 'next';

import { labEntry } from '@/lib/lab';
import { openGraphDefaults, twitterDefaults } from '@/lib/og';
import { Game } from '@/ui/lab/pushback/game';
import { PageToolbar } from '@/ui/page-toolbar';

// Config
// ---------------
export const revalidate = false;

// Meta
// ---------------
const entry = labEntry('pushback')!;

export const metadata: Metadata = {
  title: entry.title,
  description: entry.blurb,
  openGraph: {
    ...openGraphDefaults,
    title: entry.title,
    description: entry.blurb,
    type: 'website',
  },
  twitter: twitterDefaults,
};

// Page
// ---------------
// Not the article layout: the toolbar and the footer keep the page column,
// the stage breaks out of it to 960 pixels. The title screen names the
// game, so the heading is only for the outline.
const PushbackPage = () => (
  <>
    <PageToolbar />
    <section aria-labelledby="pushback-title" className="pb-10 md:pb-16">
      <h1 id="pushback-title" className="sr-only">
        {entry.title}
      </h1>
      <Game />
    </section>
  </>
);

export default PushbackPage;
