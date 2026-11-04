import type { Meta, StoryObj } from '@storybook/react-vite';

import { Muted } from '../text/text';
import { Tab, TabList, TabPanel, Tabs } from './tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { defaultValue: 'dev', keys: false },
  argTypes: {
    defaultValue: { control: 'text' },
    keys: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    value: { control: false },
    onValueChange: { control: false },
  },
  render: args => (
    <Tabs
      {...args}
      className="w-[max(calc(var(--px)*160),24em)] max-w-full tall:w-full"
    >
      <TabList aria-label="Roles">
        <Tab value="dev">
          Dev <span className="text-[0.85em] text-(--bui-muted)">3/9</span>
        </Tab>
        <Tab value="pm">
          PM <span className="text-[0.85em] text-(--bui-muted)">0/9</span>
        </Tab>
        <Tab value="design">Design</Tab>
        <Tab value="locked" disabled>
          Locked
        </Tab>
      </TabList>
      <TabPanel value="dev">
        <Muted>Dev: it works on my machine.</Muted>
      </TabPanel>
      <TabPanel value="pm">
        <Muted>PM: let&apos;s take this offline.</Muted>
      </TabPanel>
      <TabPanel value="design">
        <Muted>Design: can you make the logo bigger?</Muted>
      </TabPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click, or arrow keys on a focused tab; turn on `keys` for left and right from anywhere */
export const Default: Story = {};

/** The active tab, an idle one and a disabled one side by side */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="a">
      <TabList aria-label="States">
        <Tab value="a">Active</Tab>
        <Tab value="b">Idle</Tab>
        <Tab value="c" disabled>
          Disabled
        </Tab>
      </TabList>
    </Tabs>
  ),
};
