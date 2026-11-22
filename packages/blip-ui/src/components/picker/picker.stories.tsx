import type { Meta, StoryObj } from '@storybook/react-vite';

import { InAWindow as InAWindowExample } from './examples/in-a-window';
import { ScrollingList as ScrollingListExample } from './examples/scrolling-list';
import { TwoMenus as TwoMenusExample } from './examples/two-menus';
import { Picker, PickerItem } from './picker';

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
  render: () => <InAWindowExample />,
};

/**
 * More items than fit: the list scrolls with the cursor and a pixel rail
 * beside it shows where it is, an arrow lit at each end with more
 */
export const ScrollingList: Story = {
  name: 'Scrolling list',
  parameters: { controls: { disable: true } },
  // Upright the window spans the stage and shows more rows
  render: () => <ScrollingListExample />,
};

/**
 * Two menus on one screen: Up and Down move the one the player clicked
 * or focused, the first until then; clicking the other hands the keys over
 */
export const TwoMenus: Story = {
  name: 'Two menus',
  parameters: { controls: { disable: true } },
  render: () => <TwoMenusExample />,
};
