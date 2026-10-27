import type { Metadata } from 'next';

import { labEntry } from '@/lib/lab';
import { openGraphDefaults, twitterDefaults } from '@/lib/og';
import { Game } from '@/ui/lab/pushback/game';
import { Article } from '@/ui/layout/article';
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
const PushbackPage = () => (
  <>
    <PageToolbar />
    <Article aria-labelledby="pushback-title">
      <Article.Header>
        <Article.Title id="pushback-title" level="1">
          {entry.title}
        </Article.Title>
      </Article.Header>
      {/* Not `Article.Content`: the prose grid would lay out the stage */}
      <Game />
    </Article>
  </>
);

export default PushbackPage;
