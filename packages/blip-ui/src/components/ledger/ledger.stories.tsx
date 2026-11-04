import type { Meta, StoryObj } from '@storybook/react-vite';

import { Meter } from '../meter/meter';
import { Ledger } from './ledger';

const meta = {
  title: 'Components/Ledger',
  component: Ledger,
  args: {
    rows: [
      ['Meetings won', '12'],
      ['Longest silence', '0:42'],
      ['Coffee refills', '7'],
    ],
  },
  argTypes: { rows: { control: 'object' } },
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
export const Default: Story = {};

/** Values can be any content, a meter for one */
export const WithMeter: Story = {
  parameters: { controls: { disable: true } },
  args: {
    rows: [
      ['Momentum', <Meter key="m" aria-label="Momentum" value={3} max={5} />],
      [
        'Focus',
        <Meter key="f" aria-label="Focus" value={2} max={5} tone="info" />,
      ],
      ['Score', '4,200'],
    ],
  },
};
