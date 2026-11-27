import type { Meta, StoryObj } from '@storybook/react-vite';

import { InventoryTabs as InventoryTabsExample } from './examples/inventory-tabs';
import { Tag } from './tag';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  args: { children: 'New', variant: 'new' },
  argTypes: {
    children: { control: 'text' },
    variant: {
      control: 'inline-radio',
      options: ['new', 'done'],
      table: { defaultValue: { summary: 'new' } },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One tag through the controls */
export const Default: Story = {};

/** Every variant, beside the name it marks */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[auto_auto] items-baseline gap-x-8 gap-y-4">
      <span className="text-[0.75em] text-(--bui-dim)">new</span>
      <span>
        Lantern <Tag>New</Tag>
      </span>
      <span className="text-[0.75em] text-(--bui-dim)">done</span>
      <span>
        The lost cat <Tag variant="done">Done</Tag>
      </span>
    </div>
  ),
};

/** On a tab: the tab gives it its room */
export const InATab: Story = {
  name: 'In a tab',
  parameters: { controls: { disable: true } },
  render: () => <InventoryTabsExample />,
};
