import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../text/text';
import { Legend } from '../window/window';
import { Tab, TabList, TabPanel, Tabs } from './tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { defaultValue: 'pm', keys: false },
  argTypes: {
    defaultValue: { control: 'text' },
    keys: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    value: { control: false },
    onValueChange: { control: false },
  },
  render: args => {
    const legend = (
      <Legend
        keys={[
          ['←→', 'pool'],
          ['Esc', 'close'],
        ]}
        touch="Tap a tab"
      />
    );
    return (
      <Tabs
        {...args}
        className="w-[max(calc(var(--px)*180),26em)] max-w-full tall:w-full"
      >
        <TabList aria-label="Pools">
          <Tab value="pm">
            PM <span className="text-[0.85em] text-(--bui-dim)">7/20</span>
          </Tab>
          <Tab value="dev">
            Dev <span className="text-[0.85em] text-(--bui-dim)">3/20</span>
          </Tab>
          <Tab value="design">
            Design <span className="text-[0.85em] text-(--bui-dim)">0/20</span>
          </Tab>
        </TabList>
        <TabPanel value="pm">
          <Text>PM: let&apos;s take this offline.</Text>
          {legend}
        </TabPanel>
        <TabPanel value="dev">
          <Text>Dev: it works on my machine.</Text>
          {legend}
        </TabPanel>
        <TabPanel value="design">
          <Text>Design: can you make the logo bigger?</Text>
          {legend}
        </TabPanel>
      </Tabs>
    );
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click a tab or an arrow, or arrow keys on a focused tab; turn on `keys` for left and right from anywhere */
export const Default: Story = {};

/** The active tab, an idle one and a disabled one side by side */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="a" className="w-[max(calc(var(--px)*160),24em)]">
      <TabList aria-label="States">
        <Tab value="a">Active</Tab>
        <Tab value="b">Idle</Tab>
        <Tab value="c" disabled>
          Disabled
        </Tab>
      </TabList>
      <TabPanel value="a">
        <Text>The active tab opens into the window.</Text>
      </TabPanel>
    </Tabs>
  ),
};
