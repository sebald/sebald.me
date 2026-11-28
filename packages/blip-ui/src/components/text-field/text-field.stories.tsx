import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { Content } from '../parts/parts';
import { Window } from '../window/window';
import { NameHero } from './examples/name-hero';
import { OptionsRows as OptionsRowsExample } from './examples/options-rows';
import { TextField } from './text-field';

/** A piece of stage, wide enough for the field's text at 1x too, its form rows 8 in */
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

const meta = {
  title: 'Components/TextField',
  component: TextField,
  args: { children: 'Name', defaultValue: '' },
  argTypes: {
    children: { control: 'text' },
    defaultValue: { control: 'text' },
    maxLength: { control: 'number' },
    description: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    value: { control: false },
    onValueChange: { control: false },
    onSubmit: { control: false },
  },
} satisfies Meta<typeof TextField>;

/** A game puts its fields in a window, so the stories do */
const InWindow = ({ children }: { children: ReactNode }) => (
  <Stage>
    <Window>
      <Content>{children}</Content>
    </Window>
  </Stage>
);

export default meta;
type Story = StoryObj<typeof meta>;

/** Type in it; set `maxLength` for the characters left to count down */
export const Default: Story = {
  decorators: [
    Story => (
      <InWindow>
        <Story />
      </InWindow>
    ),
  ],
};

/** Empty, filled, at its limit, invalid and disabled, side by side */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    Story => (
      <div className="flex flex-wrap gap-section">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <InWindow>
        <TextField
          maxLength={10}
          placeholder="Hero"
          description="Up to ten letters."
        >
          Empty
        </TextField>
      </InWindow>
      <InWindow>
        <TextField maxLength={10} defaultValue="Mira">
          Filled
        </TextField>
      </InWindow>
      <InWindow>
        <TextField maxLength={10} defaultValue="Bartholome">
          At its limit
        </TextField>
      </InWindow>
      <InWindow>
        <TextField
          maxLength={10}
          defaultValue="Mira!"
          error="Letters only, no marks."
        >
          Invalid
        </TextField>
      </InWindow>
      <InWindow>
        <TextField maxLength={10} defaultValue="Mira" disabled>
          Disabled
        </TextField>
      </InWindow>
    </>
  ),
};

/** Beside a stepper and a readout: the window's content gives the rows one label column */
export const OptionsRows: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    Story => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
  render: () => <OptionsRowsExample />,
};

/** A form window: the field and its buttons, no menu; Enter takes the name */
export const NamingTheHero: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    Story => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
  render: () => <NameHero />,
};
