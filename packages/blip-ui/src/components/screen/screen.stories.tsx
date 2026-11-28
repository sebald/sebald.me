import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { TALL_BAR } from '../stage/stage';
import { ScreenTitle, Text } from '../text/text';
import { Window } from '../window/window';
import { BuyAndSell as BuyAndSellExample } from './examples/buy-and-sell';
import { LongList as LongListExample } from './examples/long-list';
import { Shop as ShopExample } from './examples/shop';
import { TitleCard as TitleCardExample } from './examples/title-card';
import { Screen } from './screen';

/**
 * A whole stage for a screen to fill: 320 stage pixels wide, 214 high, a
 * phone's height upright with the room for the bar of controls (`--bui-bar`)
 * kept along the bottom
 */
const Stage = ({ children }: { children: ReactNode }) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="relative shrink-0 overflow-hidden bg-(--bui-ground) text-(--bui-text)"
      style={{
        width: 'calc(var(--px) * 320)',
        height: `calc(var(--px) * ${pixels.tall ? 500 : 214})`,
        ['--bui-bar' as string]: `${pixels.tall ? TALL_BAR : 0}px`,
      }}
    >
      {children}
    </Pixels>
  );
};

const meta = {
  title: 'Components/Screen',
  component: Screen,
  args: {
    variant: 'default',
    children: (
      <>
        <ScreenTitle blurb="Say what the screen is for.">Screen</ScreenTitle>
        <Window>
          <Text>What the screen holds, as a column.</Text>
        </Window>
      </>
    ),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'centered', 'split'],
      table: { defaultValue: { summary: 'default' } },
    },
    children: { control: false },
  },
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On a stage of its own, for the stories that show one screen */
const onAStage: Story['decorators'] = [
  Story => (
    <Stage>
      <Story />
    </Stage>
  ),
];

export const Default: Story = { decorators: onAStage };

/** Every variant, and a column with and without a screen's title */
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
      <Stage>
        <Screen>
          <ScreenTitle blurb="A title, then the column.">Titled</ScreenTitle>
          <Window>
            <Text>The column starts under the title.</Text>
          </Window>
        </Screen>
      </Stage>
      <Stage>
        <Screen>
          <Window>
            <Text>Without a title it starts at the top.</Text>
          </Window>
        </Screen>
      </Stage>
      <Stage>
        <Screen variant="centered">
          <Window>
            <Text>One group in the middle.</Text>
          </Window>
        </Screen>
      </Stage>
      <Stage>
        <Screen variant="split">
          <Window>
            <Text>Two windows: this one first,</Text>
          </Window>
          <Window>
            <Text>this one beside it, or under it upright.</Text>
          </Window>
        </Screen>
      </Stage>
    </>
  ),
};

/** A menu screen: the title first, a window with the choices, the legend last */
export const Shop: Story = {
  decorators: onAStage,
  parameters: { controls: { disable: true } },
  render: () => <ShopExample />,
};

/** More rows than room: the window's list scrolls, its title and legend stay */
export const LongList: Story = {
  decorators: onAStage,
  parameters: { controls: { disable: true } },
  render: () => <LongListExample />,
};

/** Two windows, side by side on the wide stage and one above the other upright */
export const BuyAndSell: Story = {
  name: 'Buy and sell',
  // Two menus across a whole stage have no room for their words at 1x,
  // which a game never shows (under `MIN_SCALE`, 2.25, the stage asks for
  // a bigger window): `screen-split`'s spec checks it at 2.25 instead
  tags: ['no-vrt-1x'],
  decorators: onAStage,
  parameters: { controls: { disable: true } },
  render: () => <BuyAndSellExample />,
};

/** A title card: one group in the middle of the stage */
export const TitleCard: Story = {
  decorators: onAStage,
  parameters: { controls: { disable: true } },
  render: () => <TitleCardExample />,
};
