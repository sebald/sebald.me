import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { Heading } from '../text/text';
import { Legend, Window } from '../window/window';
import { Picker, PickerGroup, PickerItem, PickerSetting } from './picker';

const noop = () => {};

const meta = {
  title: 'Components/Picker',
  component: Picker,
  args: { label: 'Menu', active: true, children: null },
  argTypes: {
    children: { control: false },
    label: { control: 'text' },
    initial: { control: 'text' },
    active: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    stageWidth: { control: 'number' },
  },
} satisfies Meta<typeof Picker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Arrow keys or W/S move, Enter or Space picks, a tap picks */
export const Default: Story = {
  // A menu's width on the stage: 120 stage pixels, all of it upright
  decorators: [
    Story => (
      <div className="w-[calc(var(--px)*120)] max-w-full tall:w-full">
        <Story />
      </div>
    ),
  ],
  render: args => (
    <Picker {...args}>
      <PickerItem id="start" onSelect={noop}>
        Start the meeting
      </PickerItem>
      <PickerItem id="agenda" onSelect={noop}>
        Read the agenda
      </PickerItem>
      <PickerItem id="leave" variant="back" onSelect={noop}>
        Leave
      </PickerItem>
    </Picker>
  ),
};

/** A stage of its own, in stage pixels: the description box is placed on it */
const Stage = ({
  width,
  height,
  fit,
  children,
}: {
  width: number;
  height: number;
  /** At least this big, in em: text has a floor, so at 1x it needs more room than the stage pixels give */
  fit?: { width: number; height: number };
  children: ReactNode;
}) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground)"
      style={{
        width: `max(calc(var(--px) * ${width}), ${fit?.width ?? 0}em)`,
        height: `max(calc(var(--px) * ${height}), ${fit?.height ?? 0}em)`,
      }}
    >
      {children}
    </Pixels>
  );
};

/** Two items with the same props, the cursor on the first */
const Pair = ({
  name,
  ...props
}: {
  name: string;
  variant?: 'accent' | 'back';
  disabled?: boolean;
  ruledOut?: number;
}) => (
  <Picker label={name} initial="a" active={false}>
    <PickerItem id="a" onSelect={noop} {...props}>
      Selected
    </PickerItem>
    <PickerItem id="b" onSelect={noop} {...props}>
      Idle
    </PickerItem>
  </Picker>
);

const COLUMNS = [
  { name: 'default' },
  { name: 'accent', variant: 'accent' },
  { name: 'back', variant: 'back' },
  { name: 'disabled', disabled: true },
  { name: 'ruled out', ruledOut: 0.66 },
] as const;

/**
 * An item in every variant and state: selected (the cursor is on it)
 * and idle, as is, accent, back, disabled and ruled out by a hint.
 * Selected is the first line of each list
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[repeat(5,max-content)] gap-x-[calc(var(--px)*6)] gap-y-2">
      {COLUMNS.map(({ name }) => (
        <span key={name} className="text-[0.75em] text-(--bui-dim)">
          {name}
        </span>
      ))}
      {COLUMNS.map(column => (
        <Pair key={column.name} {...column} />
      ))}
    </div>
  ),
};

/**
 * The usual place of a picker: a title, the list and the keys in a
 * window. The cursor's item has a note, in a window of its own beside it
 */
export const InAWindow: Story = {
  name: 'In a window',
  parameters: { controls: { disable: true } },
  // Upright the rows are a thumb's height and the note goes under the
  // window: more rows, the full width
  render: (_, { globals }) => (
    <Stage
      width={320}
      height={globals.layout === 'tall' ? 300 : 110}
      fit={{ width: 34, height: 14 }}
    >
      <div className="absolute top-[calc(var(--px)*6)] left-[calc(var(--px)*30)] tall:inset-x-[calc(var(--px)*6)]">
        <Window className="w-[19em] tall:w-full">
          <Heading>Options</Heading>
          <Picker label="Options" className="mt-[calc(var(--px)*3)]">
            <PickerSetting
              id="mode"
              value="Easy"
              note="A ghost helps you and nothing rushes you."
              onStep={noop}
            >
              Mode
            </PickerSetting>
            <PickerItem
              id="music"
              note="M mutes everything, anywhere."
              onSelect={noop}
            >
              Music
            </PickerItem>
            <PickerGroup>
              <PickerItem
                id="erase"
                disabled
                note="Nothing saved yet."
                onSelect={noop}
              >
                Erase save
              </PickerItem>
            </PickerGroup>
            <PickerGroup>
              <PickerItem id="back" variant="back" onSelect={noop}>
                Back
              </PickerItem>
            </PickerGroup>
          </Picker>
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
            ]}
            touch="Tap a line"
          />
        </Window>
      </div>
    </Stage>
  ),
};

/**
 * More items than fit: the list scrolls with the cursor and a pixel rail
 * beside it shows where it is, an arrow lit at each end with more
 */
export const ScrollingList: Story = {
  name: 'Scrolling list',
  parameters: { controls: { disable: true } },
  // Upright the window spans the stage and shows more rows
  render: (_, { globals }) => (
    <Stage
      width={globals.layout === 'tall' ? 320 : 160}
      height={globals.layout === 'tall' ? 172 : 110}
    >
      <Window className="absolute top-[calc(var(--px)*6)] left-[calc(var(--px)*30)] h-[calc(var(--px)*80)] w-[calc(var(--px)*100)] tall:inset-x-[calc(var(--px)*6)] tall:h-[calc(var(--px)*160)] tall:w-auto">
        <Picker label="Colleagues">
          {Array.from({ length: 12 }, (_, i) => (
            <PickerItem key={i} id={`item-${i}`} onSelect={noop}>
              Colleague {i + 1}
            </PickerItem>
          ))}
        </Picker>
      </Window>
    </Stage>
  ),
};
