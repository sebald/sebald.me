import type { Meta, StoryObj } from '@storybook/react-vite';

import { Meter } from './meter';

const meta = {
  title: 'Components/Meter',
  component: Meter,
  args: {
    value: 3,
    max: 5,
    variant: 'primary',
    blink: false,
    'aria-label': 'Momentum',
  },
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 12, step: 1 } },
    max: { control: { type: 'number', min: 1, max: 12, step: 1 } },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'neutral', 'info', 'danger'],
      table: { defaultValue: { summary: 'primary' } },
    },
    blink: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    cell: {
      control: 'object',
      table: { defaultValue: { summary: '{ width: 4, height: 6 }' } },
    },
  },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop through the controls */
export const Default: Story = {};

const VARIANTS = ['primary', 'secondary', 'neutral', 'info', 'danger'] as const;
const STATES = [
  { name: 'empty', value: 0, blink: false },
  { name: 'partial', value: 3, blink: false },
  { name: 'full', value: 5, blink: false },
  { name: 'blinking', value: 5, blink: true },
] as const;

/** Every variant in every state, and other cell sizes, side by side */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[auto_repeat(4,auto)] items-center gap-x-6 gap-y-3">
      <span />
      {STATES.map(state => (
        <span key={state.name} className="text-[0.75em] text-(--bui-dim)">
          {state.name}
        </span>
      ))}
      {VARIANTS.flatMap(variant => [
        <span key={variant} className="text-[0.75em] text-(--bui-dim)">
          {variant}
        </span>,
        ...STATES.map(state => (
          <Meter
            key={`${variant}-${state.name}`}
            aria-label={`${variant} ${state.name}`}
            variant={variant}
            max={5}
            value={state.value}
            blink={state.blink}
          />
        )),
      ])}
      <span className="text-[0.75em] text-(--bui-dim)">cells</span>
      <Meter
        aria-label="Small cells"
        value={4}
        max={8}
        cell={{ width: 3, height: 4 }}
      />
      <Meter
        aria-label="Large cells"
        value={4}
        max={8}
        cell={{ width: 6, height: 9 }}
        className="col-span-3"
      />
    </div>
  ),
};
