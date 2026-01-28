'use client';

import { Dialog } from '@/ui/dialog';
import { Menu } from '@/ui/menu';

export const OverlayExamples = () => (
  <>
    <Dialog.Root>
      <Dialog.Trigger>Open Dialog</Dialog.Trigger>
      <Dialog showCloseButton>
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

    <Menu.Root>
      <Menu.Trigger>Open Menu</Menu.Trigger>
      <Menu>
        <Menu.Item>Edit</Menu.Item>
        <Menu.Item>Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item>Delete</Menu.Item>
      </Menu>
    </Menu.Root>

    <Menu.Root>
      <Menu.Trigger variant="primary">Actions</Menu.Trigger>
      <Menu>
        <Menu.Item>New File</Menu.Item>
        <Menu.Item>New Folder</Menu.Item>
        <Menu.Separator />
        <Menu.Item>Import</Menu.Item>
        <Menu.Item>Export</Menu.Item>
      </Menu>
    </Menu.Root>
  </>
);
