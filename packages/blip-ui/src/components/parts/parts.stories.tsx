import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button/button';
import { Tab, TabList, TabPanel, Tabs } from '../tabs/tabs';
import { Text } from '../text/text';
import { Legend, Window } from '../window/window';
import { Actions, Content, Title } from './parts';

const meta = {
  title: 'Components/Parts',
  component: Title,
  args: { children: 'Leave the duel?' },
  argTypes: { children: { control: 'text' } },
  decorators: [
    Story => (
      <div className="w-[max(calc(var(--px)*180),26em)] max-w-full tall:w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three parts in a window, which places them */
export const Default: Story = {
  render: args => (
    <Window>
      <Title {...args} />
      <Content>
        <Text>The round so far is lost.</Text>
      </Content>
      <Actions>
        <Button variant="secondary" size="small">
          Stay
        </Button>
        <Button size="small">Leave</Button>
      </Actions>
    </Window>
  ),
};

/** The same parts in a window, a tab's panel, and on their own */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid gap-[calc(var(--bui-px)*8)]">
      <Window>
        <Title>In a window</Title>
        <Content>
          <Text>Room under the title, the actions under what it says.</Text>
        </Content>
        <Actions>
          <Button size="small">Go</Button>
        </Actions>
        <Legend keys={[['Enter', 'go']]} touch="Tap Go" />
      </Window>
      <Tabs defaultValue="pm">
        <TabList aria-label="Pools">
          <Tab value="pm">PM</Tab>
          <Tab value="dev">Dev</Tab>
        </TabList>
        <TabPanel value="pm">
          <Title>In a tab&apos;s panel</Title>
          <Content>
            <Text>Placed the same, it is the same window.</Text>
          </Content>
        </TabPanel>
        <TabPanel value="dev">Dev</TabPanel>
      </Tabs>
      <div>
        <Title>On their own</Title>
        <Content>
          <Text>A heading and a block, placed by whatever holds them.</Text>
        </Content>
      </div>
    </div>
  ),
};
