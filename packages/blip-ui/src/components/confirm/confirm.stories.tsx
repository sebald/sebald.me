import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { Confirm } from './confirm';

const noop = () => {};

/** A stage to cover, in stage pixels */
const Stage = ({ children }: { children: ReactNode }) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground)"
      style={{
        width: `calc(var(--px) * ${pixels.tall ? 120 : 320})`,
        height: `calc(var(--px) * ${pixels.tall ? 200 : 140})`,
      }}
    >
      <p className="m-0 p-3 text-(--bui-text)">
        The screen behind: the menu the question came from, dimmed.
      </p>
      {children}
    </Pixels>
  );
};

const meta = {
  title: 'Components/Confirm',
  component: Confirm,
  args: {
    title: 'Erase the save?',
    children: 'This deletes your run and 2 shipped roles, for good.',
    confirm: 'Erase save',
    cancel: 'Cancel',
    onConfirm: noop,
    onCancel: noop,
  },
  argTypes: {
    title: { control: 'text' },
    children: { control: 'text' },
    confirm: { control: 'text' },
    cancel: {
      control: 'text',
      table: { defaultValue: { summary: 'Cancel' } },
    },
    onConfirm: { control: false },
    onCancel: { control: false },
  },
  decorators: [
    Story => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
} satisfies Meta<typeof Confirm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Over a stage: dimmed, the safe option first and selected, Escape cancels */
export const Default: Story = {};
