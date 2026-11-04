import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Start' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'destructive'],
    },
    size: { control: 'inline-radio', options: ['default', 'small'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Options' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Quit run' },
};

/** Each variant in each size, and disabled */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-3 items-center gap-4">
      {(['default', 'small'] as const).flatMap(size => [
        <Button key={`p-${size}`} size={size}>
          Start
        </Button>,
        <Button key={`s-${size}`} size={size} variant="secondary">
          Options
        </Button>,
        <Button key={`d-${size}`} size={size} variant="destructive">
          Quit run
        </Button>,
      ])}
      <Button disabled>Locked</Button>
      <Button disabled variant="secondary">
        Locked
      </Button>
      <Button disabled variant="destructive">
        Locked
      </Button>
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
