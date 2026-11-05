import type { Meta, StoryObj } from '@storybook/react-vite';

import { Muted } from '../text/text';
import { Legend } from '../window/window';
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

/** Each variant with the active tab, an idle one and a disabled one: plain, and on a window */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[max(calc(var(--px)*160),24em)] gap-[calc(var(--bui-px)*8)]">
      <Tabs defaultValue="a">
        <TabList aria-label="States">
          <Tab value="a">Active</Tab>
          <Tab value="b">Idle</Tab>
          <Tab value="c" disabled>
            Disabled
          </Tab>
        </TabList>
      </Tabs>
      <Tabs variant="window" defaultValue="a">
        <TabList aria-label="States on a window">
          <Tab value="a">Active</Tab>
          <Tab value="b">Idle</Tab>
          <Tab value="c" disabled>
            Disabled
          </Tab>
        </TabList>
        <TabPanel value="a">
          <Muted>The active tab opens into the window.</Muted>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

/** A window with pages, as the glossary has them: folder tabs from its top left, the arrows switch them and wrap; a legend last in a panel sits along its bottom edge */
export const OnAWindow: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
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
        variant="window"
        defaultValue="pm"
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
          <Muted>PM: let&apos;s take this offline.</Muted>
          {legend}
        </TabPanel>
        <TabPanel value="dev">
          <Muted>Dev: it works on my machine.</Muted>
          {legend}
        </TabPanel>
        <TabPanel value="design">
          <Muted>Design: can you make the logo bigger?</Muted>
          {legend}
        </TabPanel>
      </Tabs>
    );
  },
};
