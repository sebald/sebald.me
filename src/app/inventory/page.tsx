import type { Metadata } from 'next';

import { Blockquote } from '@/ui/blockquote';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Code } from '@/ui/code';
import { Divider } from '@/ui/divider';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { Text } from '@/ui/text';

import { DialogExample } from './dialog-example';

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Overview of styles and components.',
};

// Page
// ---------------
const InventoryPage = () => (
  <div className="grid gap-24">
    <div className="grid gap-8">
      <Headline level="3">Color Palettes</Headline>

      <div className="grid gap-2">
        <Headline level="4">Oatmeal Palette</Headline>
        <div className="flex flex-wrap gap-1">
          <div
            className="bg-oatmeal-50 h-12 w-12 rounded-lg"
            title="oatmeal-50"
          />
          <div
            className="bg-oatmeal-100 h-12 w-12 rounded-lg"
            title="oatmeal-100"
          />
          <div
            className="bg-oatmeal-200 h-12 w-12 rounded-lg"
            title="oatmeal-200"
          />
          <div
            className="bg-oatmeal-300 h-12 w-12 rounded-lg"
            title="oatmeal-300"
          />
          <div
            className="bg-oatmeal-400 h-12 w-12 rounded-lg"
            title="oatmeal-400"
          />
          <div
            className="bg-oatmeal-500 h-12 w-12 rounded-lg"
            title="oatmeal-500"
          />
          <div
            className="bg-oatmeal-600 h-12 w-12 rounded-lg"
            title="oatmeal-600"
          />
          <div
            className="bg-oatmeal-700 h-12 w-12 rounded-lg"
            title="oatmeal-700"
          />
          <div
            className="bg-oatmeal-800 h-12 w-12 rounded-lg"
            title="oatmeal-800"
          />
          <div
            className="bg-oatmeal-900 h-12 w-12 rounded-lg"
            title="oatmeal-900"
          />
          <div
            className="bg-oatmeal-950 h-12 w-12 rounded-lg"
            title="oatmeal-950"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Headline level="4">Blueberry Palette</Headline>
        <div className="flex flex-wrap gap-1">
          <div
            className="bg-blueberry-50 h-12 w-12 rounded-lg"
            title="blueberry-50"
          />
          <div
            className="bg-blueberry-100 h-12 w-12 rounded-lg"
            title="blueberry-100"
          />
          <div
            className="bg-blueberry-200 h-12 w-12 rounded-lg"
            title="blueberry-200"
          />
          <div
            className="bg-blueberry-300 h-12 w-12 rounded-lg"
            title="blueberry-300"
          />
          <div
            className="bg-blueberry-400 h-12 w-12 rounded-lg"
            title="blueberry-400"
          />
          <div
            className="bg-blueberry-500 h-12 w-12 rounded-lg"
            title="blueberry-500"
          />
          <div
            className="bg-blueberry-600 h-12 w-12 rounded-lg"
            title="blueberry-600"
          />
          <div
            className="bg-blueberry-700 h-12 w-12 rounded-lg"
            title="blueberry-700"
          />
          <div
            className="bg-blueberry-800 h-12 w-12 rounded-lg"
            title="blueberry-800"
          />
          <div
            className="bg-blueberry-900 h-12 w-12 rounded-lg"
            title="blueberry-900"
          />
          <div
            className="bg-blueberry-950 h-12 w-12 rounded-lg"
            title="blueberry-950"
          />
        </div>
      </div>
    </div>

    <Divider />

    <div className="grid gap-4">
      <Headline level="3">Typography</Headline>

      <div className="flex flex-col gap-4">
        <Headline level="1">Heading Level 1</Headline>
        <Headline level="2">Heading Level 2</Headline>
        <Headline level="3">Heading Level 3</Headline>
        <Headline level="4">Heading Level 4</Headline>
        <Headline level="5">Heading Level 5</Headline>
        <Headline level="6">Heading Level 6</Headline>
      </div>
    </div>

    <div className="grid gap-4">
      <div className="grid gap-4">
        <Headline level="4">Text</Headline>
        <div className="grid gap-4">
          <Text>
            This is a default paragraph with body size. It uses leading-relaxed
            for comfortable reading.
          </Text>
          <Text size="lead">
            This is a lead paragraph, typically used for introductory text. It
            has a larger font size to draw attention.
          </Text>
          <Text size="caption">
            This is caption text, useful for fine print, metadata, or
            supplementary information like timestamps.
          </Text>
          <Text variant="muted">
            This is muted text with reduced contrast, perfect for secondary
            content.
          </Text>
        </div>
      </div>

      <div className="grid gap-4">
        <Headline level="4">Links</Headline>
        <div className="flex flex-col gap-2">
          <Text>
            Here is a <Link href="#">default link</Link> in a paragraph.
          </Text>
          <Text>
            Here is a{' '}
            <Link href="#" variant="muted">
              muted link
            </Link>{' '}
            for subtle navigation.
          </Text>
          <Text>
            External links{' '}
            <Link href="https://example.com" target="_blank">
              open in new tab
            </Link>{' '}
            with proper security attributes.
          </Text>
        </div>
      </div>

      <div className="grid gap-4">
        <Headline level="4">Blockquote</Headline>
        <Blockquote>
          The best way to predict the future is to invent it.
        </Blockquote>
        <Blockquote attribution="Alan Kay">
          The best way to predict the future is to invent it.
        </Blockquote>
      </div>

      <div className="grid gap-4">
        <Headline level="4">Code</Headline>
        <Text>
          Use the <Code>useState</Code> hook to manage component state.
        </Text>
      </div>

      <div className="grid gap-4">
        <Headline level="4">Divider</Headline>
        <Text>Content above the divider.</Text>
        <Divider />
        <Text>Content below the default divider.</Text>
        <Divider variant="bold" />
        <Text>Content below the bold divider.</Text>
      </div>
    </div>

    <Divider />

    <div className="grid gap-4">
      <Headline level="3">Buttons</Headline>

      <div className="flex flex-wrap gap-4">
        <Button>Button</Button>
        <Button variant="dark">Button</Button>
        <Button variant="accent">Button</Button>
        <Button variant="ghost">Button</Button>
        <Button variant="outline">Button</Button>
        <Button disabled>Button</Button>
      </div>
    </div>

    <Divider />

    <div className="grid gap-4">
      <Headline level="3">Dialog</Headline>

      <DialogExample />
    </div>

    <Divider />

    <div className="grid gap-4">
      <Headline level="3">Cards</Headline>

      <Card variant="dark">
        <div className="flex h-full flex-col gap-4">
          <div>
            <Headline level="5">Dark Variant</Headline>
            <Text size="caption">
              A dark surface with high contrast content.
            </Text>
          </div>
          <div className="mt-auto flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="clear">
        <div className="flex h-full flex-col gap-4">
          <div>
            <Headline level="5">Clear Variant</Headline>
            <Text size="caption">A glass-like surface with transparency.</Text>
          </div>
          <div className="mt-auto flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="ghost">
        <div className="flex h-full flex-col gap-4">
          <div>
            <Headline level="5">Ghost Variant</Headline>
            <Text size="caption">A subtle, ethereal surface treatment.</Text>
          </div>
          <div className="mt-auto flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="tinted">
        <div className="flex h-full flex-col gap-4">
          <div>
            <Headline level="5">Tinted Variant</Headline>
            <Text size="caption">
              A warm, colored surface with blur effect.
            </Text>
          </div>
          <div className="mt-auto flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="opaque">
        <div className="flex h-full flex-col gap-4">
          <div>
            <Headline level="5">Opaque Variant</Headline>
            <Text size="caption">A solid, fully opaque surface.</Text>
          </div>
          <div className="mt-auto flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export default InventoryPage;
