import type { Meta, StoryObj } from '@storybook/react-vite';

import { BitmapText } from './bitmap-text';

const meta = {
  title: 'Components/BitmapText',
  component: BitmapText,
  args: { children: 'YOU WIN', variant: 'primary', size: 'default' },
  argTypes: {
    children: { control: 'text' },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'neutral', 'spark'],
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'inline-radio',
      options: ['default', 'large'],
      table: { defaultValue: { summary: 'default' } },
    },
  },
} satisfies Meta<typeof BitmapText>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One word through the controls */
export const Default: Story = {};

const VARIANTS = ['primary', 'neutral', 'spark'] as const;

/** Every variant at both sizes */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[auto_repeat(2,auto)] items-center gap-x-8 gap-y-4">
      <span />
      {['default', 'large'].map(col => (
        <span key={col} className="text-[0.75em] text-(--bui-dim)">
          {col}
        </span>
      ))}
      {VARIANTS.flatMap(variant => [
        <span key={variant} className="text-[0.75em] text-(--bui-dim)">
          {variant}
        </span>,
        <BitmapText key={`${variant}-d`} variant={variant}>
          YOU WIN
        </BitmapText>,
        <BitmapText key={`${variant}-l`} variant={variant} size="large">
          YOU WIN
        </BitmapText>,
      ])}
    </div>
  ),
};

/** A result and the line under it */
export const Title: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit justify-items-center gap-[calc(var(--px)*4)]">
      <BitmapText size="large">YOU WIN</BitmapText>
      <BitmapText variant="spark">FLAWLESS</BitmapText>
    </div>
  ),
};
