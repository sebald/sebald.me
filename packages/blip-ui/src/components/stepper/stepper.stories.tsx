import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { Content } from '../parts/parts';
import { Window } from '../window/window';
import { GameOptions } from './examples/game-options';
import { Stepper } from './stepper';

/** A piece of stage, its form rows 8 in */
const Stage = ({ children }: { children: ReactNode }) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground) p-edge text-(--bui-text)"
      style={{
        width: pixels.tall
          ? 'max(calc(var(--px) * 134), 20em)'
          : 'max(calc(var(--px) * 160), 22em)',
      }}
    >
      {children}
    </Pixels>
  );
};

/** A game puts its steppers in a window, so the stories do */
const InWindow = ({ children }: { children: ReactNode }) => (
  <Stage>
    <Window>
      <Content>{children}</Content>
    </Window>
  </Stage>
);

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  args: { children: 'Music', values: ['Off', 'On'], disabled: false },
  argTypes: {
    children: { control: 'text' },
    values: { control: 'object' },
    defaultValue: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    value: { control: false },
    onValueChange: { control: false },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two values, at the first: a tap, Left, Right, Enter or Space flips it */
export const Default: Story = {
  decorators: [Story => <InWindow>{Story()}</InWindow>],
};

/** Two values and more, with a description, an error, and disabled */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  decorators: [Story => <InWindow>{Story()}</InWindow>],
  render: () => (
    <>
      <Stepper values={['Off', 'On']} defaultValue="On">
        Music
      </Stepper>
      <Stepper values={['Off', 'On']}>Hints</Stepper>
      <Stepper
        values={['Slow', 'Normal', 'Fast']}
        defaultValue="Normal"
        description="How fast lines are written out."
      >
        Text speed
      </Stepper>
      <Stepper
        values={['Easy', 'Normal', 'Hard']}
        defaultValue="Hard"
        error="Hard needs the first act beaten."
      >
        Difficulty
      </Stepper>
      <Stepper values={['Off', 'On']} defaultValue="On" disabled>
        Disabled
      </Stepper>
    </>
  ),
};

/** A game's options as a form: the rows, then the buttons, all by the arrows */
export const Options: Story = {
  parameters: { controls: { disable: true } },
  decorators: [Story => <Stage>{Story()}</Stage>],
  render: () => <GameOptions />,
};
