import type { Meta, StoryObj } from '@storybook/react-vite';

import { BitmapText } from './bitmap-text';

const meta = {
  title: 'Components/BitmapText',
  component: BitmapText,
  args: { children: 'YOU WIN', tone: 'primary', scale: 2, shadow: true },
  argTypes: {
    children: { control: 'text' },
    tone: {
      control: 'select',
      options: ['primary', 'secondary', 'neutral', 'info', 'danger', 'spark'],
      table: { defaultValue: { summary: 'primary' } },
    },
    scale: {
      control: { type: 'number', min: 1, max: 6 },
      table: { defaultValue: { summary: '2' } },
    },
    shadow: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
  },
} satisfies Meta<typeof BitmapText>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One word through the controls */
export const Default: Story = {};

const TONES = [
  'primary',
  'secondary',
  'neutral',
  'info',
  'danger',
  'spark',
] as const;

/** Every tone, with its drop and without */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[auto_repeat(2,auto)] items-center gap-x-8 gap-y-4">
      <span />
      {['shadow', 'no shadow'].map(col => (
        <span key={col} className="text-[0.75em] text-(--bui-dim)">
          {col}
        </span>
      ))}
      {TONES.flatMap(tone => [
        <span key={tone} className="text-[0.75em] text-(--bui-dim)">
          {tone}
        </span>,
        <BitmapText key={`${tone}-s`} tone={tone}>
          YOU WIN
        </BitmapText>,
        <BitmapText key={`${tone}-n`} tone={tone} shadow={false}>
          YOU WIN
        </BitmapText>,
      ])}
    </div>
  ),
};

/** A title and a line under it, at two sizes */
export const Title: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit justify-items-center gap-[calc(var(--px)*4)]">
      <BitmapText scale={4}>ROADMAP</BitmapText>
      <BitmapText scale={2} tone="spark">
        FLAWLESS
      </BitmapText>
    </div>
  ),
};
