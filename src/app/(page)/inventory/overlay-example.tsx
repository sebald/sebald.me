'use client';

import { Dialog } from '@/ui/dialog';
import { Popover } from '@/ui/popover';

export const OverlayExample = () => (
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
          <Dialog.Close>Okay</Dialog.Close>
          <Dialog.Close>Close</Dialog.Close>
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
          <Dialog.Close>Okay</Dialog.Close>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </Dialog.Root>

    <Popover.Root>
      <Popover.Trigger>Open Popover</Popover.Trigger>
      <Popover>
        <Popover.Title>Popover Title</Popover.Title>
        <Popover.Description>
          This is a simple popover example with some useful content.
        </Popover.Description>
      </Popover>
    </Popover.Root>

    <Popover.Root modal={true}>
      <Popover.Trigger>Open Modal Popover</Popover.Trigger>
      <Popover variant="opaque" align="end" showCloseButton>
        <Popover.Title>Modal Popover</Popover.Title>
        <Popover.Body>
          This popover has a backdrop and modal behavior.
        </Popover.Body>
      </Popover>
    </Popover.Root>
  </div>
);
