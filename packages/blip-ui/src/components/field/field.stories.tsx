import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { Content } from '../parts/parts';
import { TextInput } from '../text-field/text-field';
import { Window } from '../window/window';
import { NewRun } from './examples/new-run';
import { Field, FieldDescription, FieldError, FieldLabel } from './field';

/** A piece of stage, wide enough for a field's text at 1x too, its form rows 8 in */
const Stage = ({ children }: { children: ReactNode }) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground) p-[calc(var(--bui-px)*6)] text-(--bui-text)"
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

/** A game puts its fields in a window's content, so the stories do */
const InWindow = ({ children }: { children: ReactNode }) => (
  <Stage>
    <Window>
      <Content>{children}</Content>
    </Window>
  </Stage>
);

const meta = {
  title: 'Components/Field',
  component: Field,
  args: { disabled: false, children: null },
  argTypes: {
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: { control: 'text' },
    children: { control: false },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A label, a control and a description; `disabled` dims them together */
export const Default: Story = {
  decorators: [
    Story => (
      <InWindow>
        <Story />
      </InWindow>
    ),
  ],
  render: args => (
    <Field {...args}>
      <FieldLabel>Name</FieldLabel>
      <TextInput placeholder="Hero" />
      <FieldDescription>Shown on the save.</FieldDescription>
    </Field>
  ),
};

/**
 * The words a field can have, as rows of one window: a label alone, with a
 * description, with the characters left, with an error, with all three,
 * and disabled
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    Story => (
      <InWindow>
        <Story />
      </InWindow>
    ),
  ],
  render: () => (
    <>
      <Field>
        <FieldLabel>Label</FieldLabel>
        <TextInput defaultValue="Mira" />
      </Field>
      <Field>
        <FieldLabel>Described</FieldLabel>
        <TextInput placeholder="Hero" />
        <FieldDescription>Shown on the save.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Counted</FieldLabel>
        <TextInput maxLength={8} defaultValue="Mira" />
      </Field>
      <Field>
        <FieldLabel>Invalid</FieldLabel>
        <TextInput maxLength={4} defaultValue="M" />
        <FieldError>Three or four letters.</FieldError>
      </Field>
      <Field>
        <FieldLabel>Everything</FieldLabel>
        <TextInput maxLength={6} defaultValue="19x7" />
        <FieldDescription>Leave it empty for a random run.</FieldDescription>
        <FieldError>Digits only, such as 1987.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Disabled</FieldLabel>
        <TextInput maxLength={8} defaultValue="Mira" />
        <FieldDescription>Set when the run began.</FieldDescription>
      </Field>
    </>
  ),
};

/** A form window: a `TextField` and a `Field` composed by hand, their labels in one column */
export const NewRunForm: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    Story => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
  render: () => <NewRun />,
};
