import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../components/button/button';
import { IconButton } from '../components/icon-button/icon-button';
import { Content } from '../components/parts/parts';
import { Picker, PickerItem } from '../components/picker/picker';
import { Switch } from '../components/switch/switch';
import { Tab, TabList, TabPanel, Tabs } from '../components/tabs/tabs';
import { TextField } from '../components/text-field/text-field';
import { Text } from '../components/text/text';
import { Window } from '../components/window/window';

const noop = () => {};

const meta = {
  title: 'Foundations/Focus',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every control in one window, to Tab through: each shows the mark
 * (foundations/focus.mdx). Looked at by hand, so no visual test takes it
 */
export const Overview: Story = {
  tags: ['no-vrt'],
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[max(calc(var(--px)*200),30em)] max-w-full">
      <Tabs defaultValue="controls">
        <TabList aria-label="Controls">
          <Tab value="controls">Controls</Tab>
          <Tab value="menu">Menu</Tab>
        </TabList>
        <TabPanel value="controls">
          <Window>
            <Content>
              <div className="flex flex-wrap items-center gap-[calc(var(--bui-px)*3)]">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <IconButton
                  icon="back"
                  label="Back"
                  aria-label="Back"
                  slot="leave"
                />
              </div>
              <TextField defaultValue="Ada">Name</TextField>
              <TextField defaultValue="" error="Needs a name">
                Invalid
              </TextField>
              <Switch>Music</Switch>
            </Content>
          </Window>
        </TabPanel>
        <TabPanel value="menu">
          <Window>
            <Content>
              <Text>Tab to a row: its cursor shows in the primary colour.</Text>
              <Picker label="Menu" active={false}>
                <PickerItem id="start" onSelect={noop}>
                  Start
                </PickerItem>
                <PickerItem id="options" onSelect={noop}>
                  Options
                </PickerItem>
              </Picker>
            </Content>
          </Window>
        </TabPanel>
      </Tabs>
    </div>
  ),
};
