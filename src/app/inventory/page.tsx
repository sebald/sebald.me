'use client';

import type { Metadata } from 'next';

import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Dialog } from '@/ui/dialog';

// Meta
// ---------------
// export const metadata: Metadata = {
//   title: 'Inventory',
//   description: 'Overview of styles and components.',
// };

// Page
// ---------------
const InventoryPage = () => (
  <div className="grid gap-24">
    <div className="grid gap-8">
      <div>
        <div className="mb-4 text-sm font-semibold">Oatmeal Palette</div>
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

      <div>
        <div className="mb-4 text-sm font-semibold">Blueberry Palette</div>
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

    <div className="grid gap-4">
      <div className="flex flex-wrap gap-4">
        <Button>Button</Button>
        <Button variant="dark">Button</Button>
        <Button variant="accent">Button</Button>
        <Button variant="ghost">Button</Button>
        <Button variant="outline">Button</Button>
        <Button disabled>Button</Button>
      </div>
    </div>
    <div className="flex flex-wrap gap-4">
      <Dialog.Root>
        <Dialog.Trigger>Open Dialog</Dialog.Trigger>
        <Dialog>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>
            This is a simple dialog example.
          </Dialog.Description>
          <Dialog.Actions>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Actions>
        </Dialog>
      </Dialog.Root>
      <Dialog.Root modal={false} disablePointerDismissal>
        <Dialog.Trigger>Open Non-modal Dialog (bottom)</Dialog.Trigger>
        <Dialog position="bottom" size="full">
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>
            This is a simple dialog example.
          </Dialog.Description>
          <Dialog.Actions>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Actions>
        </Dialog>
      </Dialog.Root>
    </div>

    <div className="grid gap-4">
      <Card variant="dark">
        <div className="flex flex-col gap-4">
          <div>Dark</div>
          <div className="flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="clear">
        <div className="flex flex-col gap-4">
          <div>Clear</div>
          <div className="flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="ghost">
        <div className="flex flex-col gap-4">
          <div>Ghost</div>
          <div className="flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="tinted">
        <div className="flex flex-col gap-4">
          <div>Tinted</div>
          <div className="flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="opaque">
        <div className="flex flex-col gap-4">
          <div>Opaque</div>
          <div className="flex flex-wrap gap-4">
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
