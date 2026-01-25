'use client';

import { Dialog } from '@/ui/dialog';

export const OverlayExamples = () => (
  <>
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
          <Dialog.Close variant="primary">Okay</Dialog.Close>
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
          <Dialog.Close variant="primary">Okay</Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </Dialog.Root>
  </>
);
