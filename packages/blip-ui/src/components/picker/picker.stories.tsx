import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { Setting } from '../setting/setting';
import { Heading } from '../text/text';
import { Legend, Window } from '../window/window';
import { Picker, type PickerItem } from './picker';

const noop = () => {};

const ITEMS: PickerItem[] = [
  { id: 'start', label: 'Start the meeting', onSelect: noop },
  { id: 'agenda', label: 'Read the agenda', onSelect: noop },
  { id: 'leave', label: 'Leave', back: true, onSelect: noop },
];

const meta = {
  title: 'Components/Picker',
  component: Picker,
  args: {
    items: ITEMS,
    label: 'Menu',
    active: true,
  },
  argTypes: {
    items: { control: 'object' },
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
};

/** A stage of its own, in stage pixels: the description box is placed on it */
const Stage = ({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground)"
      style={{
        width: `calc(var(--px) * ${width})`,
        height: `calc(var(--px) * ${height})`,
      }}
    >
      {children}
    </Pixels>
  );
};

const dim = (id: string, label: string, extra?: Partial<PickerItem>) => ({
  id,
  label,
  onSelect: noop,
  ...extra,
});

const COLUMNS: { name: string; items: PickerItem[] }[] = [
  {
    name: 'default',
    items: [dim('a', 'Selected'), dim('b', 'Idle')],
  },
  {
    name: 'accent',
    items: [
      dim('a', 'Selected', { accent: true }),
      dim('b', 'Idle', { accent: true }),
    ],
  },
  {
    name: 'disabled',
    items: [
      dim('a', 'Selected', { disabled: true }),
      dim('b', 'Idle', { disabled: true }),
    ],
  },
  {
    name: 'dimmed',
    items: [dim('a', 'Selected', { dim: 0.5 }), dim('b', 'Idle', { dim: 0.5 })],
  },
];

/**
 * An item in every state: selected (the cursor is on it) and idle, in
 * its colours as is, accent, disabled and dimmed. Selected is the first
 * line of each list
 */
export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-fit grid-cols-[repeat(4,max-content)] gap-x-[calc(var(--px)*6)] gap-y-2">
      {COLUMNS.map(({ name }) => (
        <span key={name} className="text-[0.75em] text-(--bui-dim)">
          {name}
        </span>
      ))}
      {COLUMNS.map(({ name, items }) => (
        <Picker
          key={name}
          label={name}
          items={items}
          initial="a"
          active={false}
        />
      ))}
    </div>
  ),
};

const WINDOW_ITEMS: PickerItem[] = [
  {
    id: 'mode',
    label: (
      <span className="flex items-center gap-[1ch]">
        Mode
        <Setting first last={false}>
          Easy
        </Setting>
      </span>
    ),
    note: 'A ghost helps you and nothing rushes you.',
    onSelect: noop,
    onStep: noop,
  },
  dim('music', 'Music', { note: 'M mutes everything, anywhere.' }),
  dim('erase', 'Erase save', {
    apart: true,
    disabled: true,
    note: 'Nothing saved yet.',
  }),
  dim('back', 'Back', { apart: true, back: true }),
];

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
    <Stage width={320} height={globals.layout === 'tall' ? 300 : 110}>
      <div className="absolute top-[calc(var(--px)*6)] left-[calc(var(--px)*30)] tall:inset-x-[calc(var(--px)*6)]">
        <Window
          className="w-[19em] tall:w-full"
          legend={
            <Legend
              keys={[
                ['↑↓', 'choose'],
                ['Enter', 'confirm'],
              ]}
              touch="Tap a line"
            />
          }
        >
          <Heading>Options</Heading>
          <Picker
            label="Options"
            className="mt-[calc(var(--px)*3)]"
            items={WINDOW_ITEMS}
          />
        </Window>
      </div>
    </Stage>
  ),
};

const LONG: PickerItem[] = Array.from({ length: 12 }, (_, i) =>
  dim(`item-${i}`, `Colleague ${i + 1}`),
);

/**
 * More items than fit: the list scrolls with the cursor and a pixel rail
 * beside it shows where it is, an arrow lit at each end with more
 */
export const ScrollingList: Story = {
  name: 'Scrolling list',
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage width={160} height={110}>
      <Window className="absolute top-[calc(var(--px)*6)] left-[calc(var(--px)*30)] h-[calc(var(--px)*80)] w-[calc(var(--px)*100)] tall:left-0 tall:h-[calc(var(--px)*160)] tall:w-full">
        <Picker label="Colleagues" items={LONG} />
      </Window>
    </Stage>
  ),
};
