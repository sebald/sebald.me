import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { Button } from '../button/button';
import { Actions, Content } from '../parts/parts';
import { TextField } from '../text-field/text-field';
import { Window } from '../window/window';
import { SaveSlot } from './examples/save-slot';
import { Form } from './form';

/** A piece of stage, wide enough for a field's text at 1x too */
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
  title: 'Components/Form',
  component: Form,
  args: { children: null },
  argTypes: {
    children: { control: false },
    onSubmit: { control: false },
  },
  decorators: [
    Story => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two fields and a row of buttons; Down moves through them and round */
export const Default: Story = {
  render: args => (
    <Window>
      <Content>
        <Form {...args}>
          <TextField name="name" defaultValue="Mira">
            Name
          </TextField>
          <TextField name="title" placeholder="The Bold">
            Title
          </TextField>
          <Actions>
            <Button type="submit">Save</Button>
            <Button variant="secondary">Back</Button>
          </Actions>
        </Form>
      </Content>
    </Window>
  ),
};

/** The rows a form holds: fields with words and an error, a disabled one, and buttons */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Window>
      <Content>
        <Form>
          <TextField name="name" maxLength={10} defaultValue="Mira">
            Name
          </TextField>
          <TextField
            name="tag"
            maxLength={4}
            defaultValue="M"
            error="Three or four letters."
          >
            Team tag
          </TextField>
          <TextField name="seed" defaultValue="1987" disabled>
            Seed
          </TextField>
          <Actions>
            <Button type="submit">Save</Button>
            <Button variant="secondary">Back</Button>
            <Button variant="destructive">Erase</Button>
          </Actions>
        </Form>
      </Content>
    </Window>
  ),
};

/** Naming a save: no key code of the game's own, the form moves its rows */
export const SavingAGame: Story = {
  parameters: { controls: { disable: true } },
  render: () => <SaveSlot />,
};
