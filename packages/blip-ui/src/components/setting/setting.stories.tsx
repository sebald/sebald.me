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
} satisfies Meta<typeof Setting>;

export default meta;
type Story = StoryObj<typeof meta>;

/** In a row as a Picker item shows it: the setting's name, its value at the end */
export const Default: Story = {
  decorators: [
    Story => (
      <div className="flex w-[calc(var(--px)*80)] items-center gap-[1ch] text-(--bui-text-bright)">
        Mode
        <Story />
      </div>
    ),
  ],
};

/** A choice, which goes round with both arrows lit, and a range at its min and its max, where the arrow it cannot follow is dim */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*80)] gap-2 text-(--bui-text-bright)">
      {(
        [
          ['Mode', 'choice', 'Normal', false, false],
          ['Volume', 'min', '0', true, false],
          ['Volume', 'max', '10', false, true],
        ] as const
      ).map(([name, kind, value, first, last]) => (
        <div key={kind} className="flex items-center gap-[1ch]">
          {name}
          <span className="text-[0.75em] text-(--bui-dim)">{kind}</span>
          <Setting first={first} last={last}>
            {value}
          </Setting>
        </div>
      ))}
    </div>
  ),
};
