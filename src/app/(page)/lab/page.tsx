import type { Metadata } from 'next';

import { LAB_ENTRIES, labUrl } from '@/lib/lab';
import { openGraphDefaults, twitterDefaults } from '@/lib/og';
import { Card } from '@/ui/card';
import { Headline } from '@/ui/headline';
import { Article } from '@/ui/layout/article';
import { PageToolbar } from '@/ui/page-toolbar';
import { Text } from '@/ui/text';

// Config
// ---------------
export const revalidate = false;

// Meta
// ---------------
const description =
  'Things that are more code than prose: games, demos and interactive examples.';

export const metadata: Metadata = {
  title: 'Lab',
  description,
  openGraph: {
    ...openGraphDefaults,
    title: 'Lab',
    description,
    type: 'website',
  },
  twitter: twitterDefaults,
};

// Page
// ---------------
const LabPage = () => (
  <>
    <PageToolbar />
    <Article aria-labelledby="lab-title">
      <Article.Header>
        <Article.Title id="lab-title" level="1">
          Lab
        </Article.Title>
        <Text variant="muted" className="mt-4 text-pretty">
          {description}
        </Text>
      </Article.Header>
      <Article.Content className="not-prose">
        <ul className="grid gap-6">
          {LAB_ENTRIES.map(entry => (
            <li key={entry.slug}>
              <Card href={labUrl(entry)} inset="snug">
                <div className="grid gap-2">
                  <Headline level="2" as="h2">
                    {entry.title}
                  </Headline>
                  <Text variant="muted" className="text-pretty">
                    {entry.blurb}
                  </Text>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Article.Content>
    </Article>
  </>
);

export default LabPage;
