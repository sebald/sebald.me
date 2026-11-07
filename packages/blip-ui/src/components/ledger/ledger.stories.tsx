import type { Meta, StoryObj } from '@storybook/react-vite';

import { Meter } from '../meter/meter';
import { Ledger, LedgerRow } from './ledger';

const meta = {
  title: 'Components/Ledger',
  component: Ledger,
  args: { children: null },
  argTypes: { children: { control: false } },
  parameters: { controls: { disable: true } },
  decorators: [
    Story => (
      <div className="w-[calc(var(--px)*120)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Ledger>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Rows of a label and a value */
export const Default: Story = {
  render: () => (
    <Ledger>
      <LedgerRow label="Meetings won">12</LedgerRow>
      <LedgerRow label="Longest silence">0:42</LedgerRow>
      <LedgerRow label="Coffee refills">7</LedgerRow>
    </Ledger>
  ),
};

/** Values can be any content, a meter for one */
export const WithMeter: Story = {
  render: () => (
    <Ledger>
      <LedgerRow label="Momentum">
        <Meter aria-label="Momentum" value={3} max={5} />
      </LedgerRow>
      <LedgerRow label="Their momentum">
        <Meter
          aria-label="Their momentum"
          value={2}
          max={5}
          variant="secondary"
        />
      </LedgerRow>
      <LedgerRow label="Score">4,200</LedgerRow>
    </Ledger>
  ),
};
