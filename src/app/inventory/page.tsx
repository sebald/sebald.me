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
        <Button variant="highlight">Button</Button>
        <Button variant="ghost">Button</Button>
        <Button disabled>Button</Button>
      </div>
    </div>
    <div className="grid gap-10">
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
    </div>

    <div className="grid justify-items-center gap-10 *:aspect-video *:w-1/2">
      <Card>
        <div className="flex flex-col gap-4">
          <div>Default</div>
          <div className="flex flex-nowrap gap-4">
            <Button>Button</Button>
            <Button variant="dark">Button</Button>
            <Button variant="ghost">Button</Button>
          </div>
        </div>
      </Card>
      <Card variant="clear">
        <div>Clear</div>
        <div className="flex flex-nowrap gap-4">
          <Button>Button</Button>
          <Button variant="dark">Button</Button>
          <Button variant="ghost">Button</Button>
        </div>
      </Card>
      <Card variant="ghost">
        <div>Ghost</div>
        <div className="flex flex-nowrap gap-4">
          <Button>Button</Button>
          <Button variant="dark">Button</Button>
          <Button variant="ghost">Button</Button>
        </div>
      </Card>
      <Card variant="tinted">
        <div>Tinted</div>
        <div className="flex flex-nowrap gap-4">
          <Button>Button</Button>
          <Button variant="dark">Button</Button>
          <Button variant="ghost">Button</Button>
        </div>
      </Card>
      <Card variant="opaque">
        <div>Opaque</div>
        <div className="flex flex-nowrap gap-4">
          <Button>Button</Button>
          <Button variant="dark">Button</Button>
          <Button variant="ghost">Button</Button>
        </div>
      </Card>
    </div>
  </div>
);

export default InventoryPage;
