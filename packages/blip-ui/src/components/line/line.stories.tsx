import type { Meta, StoryObj } from '@storybook/react-vite';

import { Line } from './line';

const meta = {
  title: 'Components/Line',
  component: Line,
  args: {
    children: "Let's circle back on this.",
    variant: 'primary',
    past: false,
  },
  argTypes: {
    children: { control: 'text' },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      table: { defaultValue: { summary: 'primary' } },
    },
    past: {
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
} satisfies Meta<typeof Line>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One line through the controls */
export const Default: Story = {};

const VARIANTS = ['primary', 'secondary'] as const;

/** Every variant, live and past, side by side */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*260)] max-w-full grid-cols-[auto_1fr_1fr] items-start gap-x-6 gap-y-3">
      <span />
      {['live', 'past'].map(col => (
        <span key={col} className="text-[0.75em] text-(--bui-dim)">
          {col}
        </span>
      ))}
      {VARIANTS.flatMap(variant => [
        <span key={variant} className="text-[0.75em] text-(--bui-dim)">
          {variant}
        </span>,
        <Line key={`${variant}-live`} variant={variant}>
          Synergy is key.
        </Line>,
        <Line key={`${variant}-past`} variant={variant} past>
          Synergy is key.
        </Line>,
      ])}
    </div>
  ),
};

/** An exchange: the line being answered is past, the reply is live */
export const Exchange: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*200)] max-w-full gap-3">
      <Line variant="secondary" past>
        Let’s take this offline.
      </Line>
      <Line variant="primary">Offline is where ideas go to die.</Line>
    </div>
  ),
};
