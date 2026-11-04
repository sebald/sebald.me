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

/** In the middle of its values, at the first and at the last: the arrow it cannot follow is dim */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*80)] gap-2 text-(--bui-text-bright)">
      {(
        [
          ['Normal', false, false],
          ['Easy', true, false],
          ['Hard', false, true],
        ] as const
      ).map(([value, first, last]) => (
        <div key={value} className="flex items-center gap-[1ch]">
          <span className="text-[0.75em] text-(--bui-dim)">
            {first ? 'first' : last ? 'last' : 'middle'}
          </span>
          <Setting first={first} last={last}>
            {value}
          </Setting>
        </div>
      ))}
    </div>
  ),
};
