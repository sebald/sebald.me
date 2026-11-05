import type { Meta, StoryObj } from '@storybook/react-vite';

import { Setting } from './setting';

const meta = {
  title: 'Components/Setting',
  component: Setting,
  args: { children: 'Normal', first: false, last: false },
  argTypes: {
    children: { control: 'text' },
    first: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    last: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
  decorators: [
    Story => (
      <div className="flex w-[calc(var(--px)*80)] items-center gap-[1ch] text-(--bui-text-bright)">
        Mode
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Setting>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A choice, which goes round with both arrows lit, and a range at its min and its max, where the arrow it cannot follow is dim */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*80)] gap-2 text-(--bui-text-bright)">
      {(
        [
          ['choice', 'Normal', false, false],
          ['min', '0', true, false],
          ['max', '10', false, true],
        ] as const
      ).map(([kind, value, first, last]) => (
        <div key={kind} className="flex items-center gap-[1ch]">
          <span className="text-[0.75em] text-(--bui-dim)">{kind}</span>
          <Setting first={first} last={last}>
            {value}
          </Setting>
        </div>
      ))}
    </div>
  ),
};
