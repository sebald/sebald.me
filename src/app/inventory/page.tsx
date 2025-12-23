'use client';

import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Dialog } from '@/ui/dialog';

const InventoryPage = () => (
  <div className="grid gap-24">
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

    <div className="grid auto-rows-fr grid-cols-1 gap-10 md:w-2/3">
      <Card>
        <div className="flex flex-col gap-4">
          <div>Default</div>
          <div className="flex flex-wrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="clear">
        <div>Clear</div>
        <div className="flex flex-wrap gap-4">
          <Button>Button</Button>
          <Button variant="dark">Button</Button>
          <Button variant="ghost">Button</Button>
        </div>
      </Card>
      <Card variant="ghost">
        <div>Ghost</div>
        <div className="flex flex-wrap gap-4">
          <Button>Button</Button>
          <Button variant="dark">Button</Button>
          <Button variant="ghost">Button</Button>
        </div>
      </Card>
      <Card variant="tinted">
        <div>Tinted</div>
        <div className="flex flex-wrap gap-4">
          <Button>Button</Button>
          <Button variant="dark">Button</Button>
          <Button variant="ghost">Button</Button>
        </div>
      </Card>
      <Card variant="opaque">
        <div>Opaque</div>
        <div className="flex flex-wrap gap-4">
          <Button>Button</Button>
          <Button variant="dark">Button</Button>
          <Button variant="ghost">Button</Button>
        </div>
      </Card>
    </div>
  </div>
);

export default InventoryPage;
