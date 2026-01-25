import type { Metadata } from 'next';

import { Blockquote } from '@/ui/blockquote';
import { Button } from '@/ui/button';
import { Dialog } from '@/ui/dialog';
import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';
import { Text } from '@/ui/text';

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
  <div className="grid gap-24">
    <div className="grid gap-8">
      <Headline level="3">Color Palettes</Headline>

      <div className="grid gap-2">
        <Headline level="4">Mist Palette</Headline>
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
      </div>
    </div>

    <div className="grid gap-4">
      <Headline level="3">Typography</Headline>

      <div className="flex flex-col gap-4">
        <Headline level="display">Heading Level Display</Headline>
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
    </div>

    <div className="grid gap-4">
      <Headline level="3">Buttons</Headline>

      <div className="flex flex-wrap gap-4">
        <Button>Button</Button>
        <Button variant="primary">Button</Button>
        <Button variant="secondary">Button</Button>
        <Button variant="icon">Button</Button>
        <Button variant="link">Button</Button>
        <Button disabled>Button</Button>
      </div>
    </div>

    {/* <div className="grid gap-4">
      <Headline level="3">Overlays</Headline>
      <div className="flex flex-wrap gap-4">
        <Dialog.Root>
          <Dialog.Trigger>Open Dialog</Dialog.Trigger>
          <Dialog>
            <Dialog.Title>Dialog Title</Dialog.Title>
            <Dialog.Description>
              This is a simple dialog example.
            </Dialog.Description>
            <Dialog.Body>This is the body text of the dialog.</Dialog.Body>
            <Dialog.Actions>
              <Dialog.Close>Close</Dialog.Close>
              <Dialog.Close variant="light">Okay</Dialog.Close>
            </Dialog.Actions>
          </Dialog>
        </Dialog.Root>

        <Dialog.Root modal={false} disablePointerDismissal>
          <Dialog.Trigger>Open Non-modal Dialog (bottom)</Dialog.Trigger>
          <Dialog position="bottom" size="full" layout="inline">
            <Dialog.Title>Dialog Title</Dialog.Title>
            <Dialog.Description>
              This is a simple dialog example.
            </Dialog.Description>
            <Dialog.Actions>
              <Dialog.Close>Close</Dialog.Close>
              <Dialog.Close variant="light">Okay</Dialog.Close>
            </Dialog.Actions>
          </Dialog>
        </Dialog.Root>
      </div>
    </div>*/}
  </div>
);

export default InventoryPage;
