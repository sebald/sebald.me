import type { Meta, StoryObj } from '@storybook/react-vite';

import { PartyStatus as PartyStatusExample } from './examples/party-status';
import { Readout } from './readout';

const meta = {
  title: 'Components/Readout',
  component: Readout,
  args: { value: 120, silent: false, children: 'Gold' },
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 9999, step: 1 } },
    max: { control: { type: 'number', min: 1, max: 9999, step: 1 } },
    silent: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Readout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop through the controls: a number and its label */
export const Default: Story = {};

/** A number alone, and one out of a maximum, in the states a game has them */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit gap-related">
      <Readout value={0}>Gold</Readout>
      <Readout value={1200}>Gold</Readout>
      <Readout value={42} max={50}>
        HP
      </Readout>
      <Readout value={0} max={50}>
        HP
      </Readout>
      <Readout value={10} max={10}>
        MP
      </Readout>
    </div>
  ),
};

/** Gold, HP and MP, with buttons to change them: each change is said to a screen reader */
export const PartyStatus: Story = {
  parameters: { controls: { disable: true } },
  render: () => <PartyStatusExample />,
};
