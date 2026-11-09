import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Start',
    variant: 'primary',
    size: 'default',
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'destructive'],
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'inline-radio',
      options: ['default', 'small'],
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every variant and size through the controls */
export const Default: Story = {};

const VARIANTS = ['primary', 'secondary', 'destructive'] as const;
const SIZES = ['default', 'small'] as const;

/**
 * Every variant in every size, and disabled: the one place they are all
 * side by side (and what the visual tests compare)
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[auto_repeat(3,auto)] items-center gap-4">
      {[...SIZES, 'disabled' as const].flatMap(row => [
        <span key={row} className="text-[0.75em] text-(--bui-dim)">
          {row}
        </span>,
        ...VARIANTS.map(variant => (
          <Button
            key={`${row}-${variant}`}
            variant={variant}
            size={row === 'disabled' ? 'default' : row}
            disabled={row === 'disabled'}
          >
            {variant}
          </Button>
        )),
      ])}
    </div>
  ),
};

/** A screen's actions: the main one first, the quieter one beside it */
export const Pair: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Start</Button>
      <Button variant="secondary">Back</Button>
    </div>
  ),
};
