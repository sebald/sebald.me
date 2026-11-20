import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Controls } from '../components/controls/controls';
import { IconButton, IconToggle } from '../components/icon-button/icon-button';
import { Meeting as DuelMeeting } from '../patterns/duel/examples/meeting';
import { PickARole as MenuScreen } from '../patterns/menu-screen/examples/pick-a-role';
import { Pixels, usePixels } from '../providers/pixels';

const noop = () => {};

/** The tall stage's bar of controls, in CSS pixels */
const BAR = 52;

/**
 * A whole stage, 320 stage pixels wide: 180 high on the wide layout, a
 * phone's height upright with the bar of controls along the bottom
 */
const Stage = ({ children }: { children: ReactNode }) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="relative overflow-hidden bg-(--bui-ground) text-(--bui-text)"
      style={{
        width: 'calc(var(--px) * 320)',
        height: `calc(var(--px) * ${pixels.tall ? 500 : 180})`,
        ['--bui-bar' as string]: `${pixels.tall ? BAR : 0}px`,
      }}
    >
      {children}
      <Controls show="always">
        <IconButton slot="leave" icon="back" aria-label="Back" label="Back" />

        <IconToggle
          icon="soundOff"
          pressedIcon="soundOn"
          aria-label="Sound"
          label="Sound off"
          pressedLabel="Sound on"
          pressed
          onPressedChange={noop}
        />
      </Controls>
    </Pixels>
  );
};

const meta = {
  title: 'Compositions/Together',
  // A whole stage at 1x has no room for its words (text has a floor, the
  // stage's 320 pixels don't grow), and a game never shows one that
  // small: under `MIN_SCALE` (2.25) the stage asks for a bigger window.
  // A baseline at 1x would keep a cut-off menu nobody sees
  tags: ['no-vrt-1x'],
  parameters: { controls: { disable: true } },
  decorators: [
    Story => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A menu screen: the title along the top, a window with a title, what
 * it says and a picker with a setting and a disabled item, its legend,
 * and the buttons under it
 */
export const Menu: Story = {
  render: () => <MenuScreen />,
};

/**
 * A duel: who says what in a window, the other side's bubble, the
 * pools as a ledger of meters, the clock, and the tabs of a log
 */
export const Duel: Story = {
  render: () => <DuelMeeting />,
};
