import type { Meta, StoryObj } from '@storybook/react-vite';

import { SpeechBubble } from './speech-bubble';

const meta = {
  title: 'Components/SpeechBubble',
  component: SpeechBubble,
  args: {
    children: "Great idea! I've put it on the roadmap. Q4. Of next year.",
    side: 'top',
    align: 'end',
    offset: 10,
  },
  argTypes: {
    children: { control: 'text' },
    side: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      table: { defaultValue: { summary: 'top' } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'end'],
      table: { defaultValue: { summary: 'end' } },
    },
    offset: {
      control: { type: 'number', min: 4, max: 80 },
      table: { defaultValue: { summary: '10' } },
    },
  },
  decorators: [
    Story => (
      <div className="w-[calc(var(--px)*160)] max-w-full py-[calc(var(--px)*8)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpeechBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The tail through the controls */
export const Default: Story = {};

const SIDES = ['top', 'bottom'] as const;
const ALIGNS = ['end', 'start'] as const;

/** The tail on each edge and from each corner, side by side */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <div className="grid w-[calc(var(--px)*340)] max-w-full grid-cols-[auto_1fr_1fr] items-center gap-x-6 gap-y-[calc(var(--px)*14)] py-[calc(var(--px)*6)]">
      <span />
      {ALIGNS.map(align => (
        <span key={align} className="text-[0.75em] text-(--bui-dim)">
          align {align}
        </span>
      ))}
      {SIDES.flatMap(side => [
        <span key={side} className="text-[0.75em] text-(--bui-dim)">
          side {side}
        </span>,
        ...ALIGNS.map(align => (
          <SpeechBubble key={`${side}-${align}`} side={side} align={align}>
            Q4. Of next year.
          </SpeechBubble>
        )),
      ])}
    </div>
  ),
};

/** Pointing up to the speaker under the bubble's tail */
export const AboveSpeaker: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[calc(var(--px)*160)] max-w-full justify-items-end gap-[calc(var(--px)*6)]">
      <div className="mr-[calc(var(--px)*6)] size-[calc(var(--px)*16)] bg-(--bui-secondary)" />
      <SpeechBubble className="w-full" offset={14}>
        Let’s take this offline.
      </SpeechBubble>
    </div>
  ),
};
