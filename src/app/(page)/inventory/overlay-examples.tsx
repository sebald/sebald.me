'use client';

import {
  BookmarkSimpleIcon,
  CopyIcon,
  ShareNetworkIcon,
} from '@phosphor-icons/react';

import { Button } from '@/ui/button';
import { Dialog } from '@/ui/dialog';
import { Menu } from '@/ui/menu';
import { toast } from '@/ui/toast';
import { Tooltip } from '@/ui/tooltip';

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

    <Button onClick={() => toast.add({ title: 'Changes saved' })}>
      Show Toast
    </Button>
    <Button
      onClick={() =>
        toast.add({ title: 'Something went wrong', type: 'error' })
      }
    >
      Show Error Toast
    </Button>

    <Tooltip.Root>
      <Tooltip.Trigger render={<Button />}>Show Tooltip</Tooltip.Trigger>
      <Tooltip>A short hint for a control</Tooltip>
    </Tooltip.Root>

    {/* Grouped: once one tooltip is open, its neighbours open instantly */}
    <Tooltip.Provider>
      <div className="flex items-center gap-4">
        {[
          { label: 'Copy', Icon: CopyIcon },
          { label: 'Share', Icon: ShareNetworkIcon },
          { label: 'Bookmark', Icon: BookmarkSimpleIcon },
        ].map(({ label, Icon }) => (
          <Tooltip.Root key={label}>
            <Tooltip.Trigger
              render={<Button variant="icon" aria-label={label} />}
            >
              <Icon weight="bold" aria-hidden />
            </Tooltip.Trigger>
            <Tooltip side="bottom">{label}</Tooltip>
          </Tooltip.Root>
        ))}
      </div>
    </Tooltip.Provider>
  </>
);
