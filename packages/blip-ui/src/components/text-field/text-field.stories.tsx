import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { NameHero } from './examples/name-hero';
import { TextField } from './text-field';

/** A piece of stage to type in, wide enough for the field's text at 1x too */
const Stage = ({ children }: { children: ReactNode }) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground) p-[calc(var(--bui-px)*6)] text-(--bui-text)"
      style={{
        width: `max(calc(var(--px) * ${pixels.tall ? 134 : 160}), 20em)`,
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

export default meta;
type Story = StoryObj<typeof meta>;

/** Type in it; set `maxLength` for the characters left to count down */
export const Default: Story = {
  decorators: [
    Story => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
};

/** Empty, filled, at its limit, invalid and disabled, side by side */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    Story => (
      <div className="flex flex-wrap gap-[calc(var(--bui-px)*6)]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <Stage>
        <TextField
          maxLength={10}
          placeholder="Hero"
          description="Up to ten letters."
        >
          Empty
        </TextField>
      </Stage>
      <Stage>
        <TextField maxLength={10} defaultValue="Mira">
          Filled
        </TextField>
      </Stage>
      <Stage>
        <TextField maxLength={10} defaultValue="Bartholome">
          At its limit
        </TextField>
      </Stage>
      <Stage>
        <TextField
          maxLength={10}
          defaultValue="Mira!"
          error="Letters only, no marks."
        >
          Invalid
        </TextField>
      </Stage>
      <Stage>
        <TextField maxLength={10} defaultValue="Mira" disabled>
          Disabled
        </TextField>
      </Stage>
    </>
  ),
};

/** Over a menu: Enter takes the name, Escape gives the keys back to the menu */
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
