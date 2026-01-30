import { DropIcon } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';

import { Blockquote } from '@/ui/blockquote';
import { Button } from '@/ui/button';
import { Callout } from '@/ui/callout';
import { Card } from '@/ui/card';
import { Divider } from '@/ui/divider';
import { Headline } from '@/ui/headline';
import { Article } from '@/ui/layout/article';
import { Link } from '@/ui/link';
import { Text } from '@/ui/text';

import { CodeExamples } from './code-examples';
import { OverlayExamples } from './overlay-examples';

// Config
// ---------------
export const revalidate = false;

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Overview of styles and components.',
};

// Page
// ---------------
const InventoryPage = () => (
  <Article>
    <Article.Header>
      <Article.Title level="1">Inventory</Article.Title>
    </Article.Header>
    <Article.Content>
      <div className="grid gap-24">
        <div className="grid gap-4">
          <Headline level="2">Mist Palette</Headline>

          <div className="flex flex-wrap gap-1">
            <div className="bg-mist-50 size-12 rounded-lg" title="mist-50" />
            <div className="bg-mist-100 size-12 rounded-lg" title="mist-100" />
            <div className="bg-mist-200 size-12 rounded-lg" title="mist-200" />
            <div className="bg-mist-300 size-12 rounded-lg" title="mist-300" />
            <div className="bg-mist-400 size-12 rounded-lg" title="mist-400" />
            <div className="bg-mist-500 size-12 rounded-lg" title="mist-500" />
            <div className="bg-mist-600 size-12 rounded-lg" title="mist-600" />
            <div className="bg-mist-700 size-12 rounded-lg" title="mist-700" />
            <div className="bg-mist-800 size-12 rounded-lg" title="mist-800" />
            <div className="bg-mist-900 size-12 rounded-lg" title="mist-900" />
            <div className="bg-mist-950 size-12 rounded-lg" title="mist-950" />
          </div>

          <Headline level="2">Black Palette</Headline>

          <div className="flex flex-wrap gap-1">
            <div className="bg-black-50 size-12 rounded-lg" title="black-50" />
            <div
              className="bg-black-100 size-12 rounded-lg"
              title="black-100"
            />
            <div
              className="bg-black-200 size-12 rounded-lg"
              title="black-200"
            />
            <div
              className="bg-black-300 size-12 rounded-lg"
              title="black-300"
            />
            <div
              className="bg-black-400 size-12 rounded-lg"
              title="black-400"
            />
            <div
              className="bg-black-500 size-12 rounded-lg"
              title="black-500"
            />
            <div
              className="bg-black-600 size-12 rounded-lg"
              title="black-600"
            />
            <div
              className="bg-black-700 size-12 rounded-lg"
              title="black-700"
            />
            <div
              className="bg-black-800 size-12 rounded-lg"
              title="black-800"
            />
            <div
              className="bg-black-900 size-12 rounded-lg"
              title="black-900"
            />
            <div
              className="bg-black-950 size-12 rounded-lg"
              title="black-950"
            />
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Headlines</Headline>

          <div className="grid gap-2">
            <Headline level="1">Heading Level 1</Headline>
            <Headline level="2">Heading Level 2</Headline>
            <Headline level="3">Heading Level 3</Headline>
            <Headline level="4">Heading Level 4</Headline>
            <Headline level="5">Heading Level 5</Headline>
            <Headline level="6">Heading Level 6</Headline>
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Text</Headline>
          <div className="grid gap-8">
            <Text>
              This is a default paragraph with body size. It uses
              leading-relaxed for comfortable reading.
            </Text>
            <Text variant="muted">
              This is muted text with reduced contrast, perfect for secondary
              content.
            </Text>
            <Text size="caption">
              This is caption text, useful for fine print, metadata, or
              supplementary information like timestamps.
            </Text>
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Links</Headline>
          <div className="grid gap-8">
            <Text>
              Here is a <Link href="#">default link</Link> in a paragraph.
            </Text>
            <Text>
              External links{' '}
              <Link href="https://example.com" target="_blank">
                open in new tab
              </Link>{' '}
              with proper attributes.
            </Text>
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Blockquote</Headline>
          <div className="grid gap-8">
            <Blockquote>
              The best way to predict the future is to invent it.
            </Blockquote>
            <Blockquote attribution="Alan Kay">
              The best way to predict the future is to invent it.
            </Blockquote>
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Callout</Headline>
          <div className="grid gap-4">
            <Callout title="Note">
              This is a note callout for general remarks and tips.
            </Callout>
            <Callout variant="info" title="Info">
              This is an info callout for contextual information.
            </Callout>
            <Callout variant="success" title="Success">
              This is a success callout for positive outcomes.
            </Callout>
            <Callout variant="warning" title="Warning">
              This is a warning callout for potential issues.
            </Callout>
            <Callout variant="danger" title="Danger">
              This is a danger callout for critical information.
            </Callout>
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Divider</Headline>

          <div className="grid gap-8">
            <Text>Content above the divider.</Text>
            <Divider />
            <Text>Content below the default divider.</Text>
            <div className="flex gap-2">
              <Text>Content left the vertical divider.</Text>
              <Divider orientation="vertical" />
              <Text>Content right the vertical divider.</Text>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Buttons</Headline>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Button</Button>
            <Button variant="secondary">Button</Button>
            <Button variant="icon">
              <DropIcon weight="bold" />
            </Button>
            <Button variant="link">Button</Button>
            <Button disabled>Button</Button>
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Card</Headline>

          <div className="flex flex-wrap gap-4">
            <Card>
              <div className="grid gap-8">
                <Headline level="2">Card Title</Headline>
                <Text>
                  This is an example of a card component. Cards are used to
                  group related information together in a visually distinct
                  container.
                </Text>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Overlays</Headline>

          <div className="flex flex-wrap gap-4">
            <OverlayExamples />
          </div>
        </div>

        <div className="grid gap-4">
          <Headline level="2">Code</Headline>
          <CodeExamples />
        </div>
      </div>
    </Article.Content>
  </Article>
);

export default InventoryPage;
