import type { Meta, StoryObj } from '@storybook/react-vite';

import { Music as MusicExample } from './examples/music';
import { Switch } from './switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { children: 'Music', disabled: false },
  argTypes: {
    children: { control: 'text' },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    checked: { control: false },
    defaultChecked: { control: 'boolean' },
    onCheckedChange: { control: false },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A tap, Left, Right, Enter or Space flips it */
export const Default: Story = {
  args: { defaultChecked: true },
};

/** On, off, and disabled in both states, which a player cannot change */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid gap-[calc(var(--bui-px)*3)]">
      <Switch defaultChecked>Music</Switch>
      <Switch>Music</Switch>
      <Switch disabled defaultChecked>
        Music
      </Switch>
      <Switch disabled>Music</Switch>
    </div>
  ),
};

/** The caller keeps the state and says it in words too: what a flip does */
export const Music: Story = {
  parameters: { controls: { disable: true } },
  render: () => <MusicExample />,
};
