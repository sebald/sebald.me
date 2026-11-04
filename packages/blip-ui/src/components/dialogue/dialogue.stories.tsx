import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dialogue } from './dialogue';

const meta = {
  title: 'Components/Dialogue',
  component: Dialogue,
  args: {
    children: "Let's circle back on this.",
    tone: 'primary',
    muted: false,
  },
  argTypes: {
    children: { control: 'text' },
    tone: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      table: { defaultValue: { summary: 'primary' } },
    },
    muted: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  decorators: [
    Story => (
      <div className="w-[calc(var(--px)*200)] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dialogue>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One line through the controls */
export const Default: Story = {};

const TONES = ['primary', 'secondary'] as const;

/** Every tone, live and muted, side by side */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*260)] max-w-full grid-cols-[auto_1fr_1fr] items-start gap-x-6 gap-y-3">
      <span />
      {['live', 'muted'].map(col => (
        <span key={col} className="text-[0.75em] text-(--bui-dim)">
          {col}
        </span>
      ))}
      {TONES.flatMap(tone => [
        <span key={tone} className="text-[0.75em] text-(--bui-dim)">
          {tone}
        </span>,
        <Dialogue key={`${tone}-live`} tone={tone}>
          Synergy is key.
        </Dialogue>,
        <Dialogue key={`${tone}-muted`} tone={tone} muted>
          Synergy is key.
        </Dialogue>,
      ])}
    </div>
  ),
};

/** An exchange: the line being answered is muted, the reply is live */
export const Exchange: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*200)] max-w-full gap-3">
      <Dialogue tone="secondary" muted>
        Let’s take this offline.
      </Dialogue>
      <Dialogue tone="primary">Offline is where ideas go to die.</Dialogue>
    </div>
  ),
};
