'use client';

import { useState } from 'react';

import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Dialog } from '@/ui/dialog';

const InventoryPage = () => (
  <div className="grid gap-24">
    <div className="grid gap-4">
      <div className="flex flex-nowrap gap-4">
        <Button variant="primary">Button</Button>
        <Button>Button</Button>
        <Button variant="ghost">Button</Button>
      </div>
      <Card>
        <div className="flex flex-nowrap justify-end gap-4">
          <Button variant="cutout">Button</Button>
          <Button variant="cutout-primary">Button</Button>
        </div>
      </Card>
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
      <Card>Default</Card>
      <Card variant="clear">Clear</Card>
      <Card variant="ghost">Ghost</Card>
      <Card variant="tinted">Tinted</Card>
      <Card variant="opaque">Opaque</Card>
    </div>
  </div>
);

export default InventoryPage;
