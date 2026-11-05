import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Button } from '../components/button/button';
import { ControlGroup, Controls } from '../components/controls/controls';
import { IconButton, IconToggle } from '../components/icon-button/icon-button';
import { Ledger } from '../components/ledger/ledger';
import { Line } from '../components/line/line';
import { Meter } from '../components/meter/meter';
import {
  Picker,
  PickerGroup,
  PickerItem,
  PickerSetting,
} from '../components/picker/picker';
import { SpeechBubble } from '../components/speech-bubble/speech-bubble';
import { Tab, TabList, TabPanel, Tabs } from '../components/tabs/tabs';
import { Heading, ScreenTitle, Text } from '../components/text/text';
import { Timer } from '../components/timer/timer';
import { Legend, Window } from '../components/window/window';
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
        <ControlGroup side="start">
          <IconButton icon="back" aria-label="Back" label="Back" />
        </ControlGroup>
        <ControlGroup side="end">
          <IconToggle
            icon="soundOff"
            pressedIcon="soundOn"
            aria-label="Sound"
            label="Sound off"
            pressedLabel="Sound on"
            pressed
            onPressedChange={noop}
          />
        </ControlGroup>
      </Controls>
    </Pixels>
  );
};

const meta = {
  title: 'Compositions/Together',
  // Not an exception, a placeholder: a whole stage at 1x has no room for
  // its words (text has a floor, the stage's 320 pixels don't grow), and
  // a baseline of that would keep the cut-off menu as the expected look.
  // The game can get that small (MIN_SCALE 1.1), so its step to Blip UI
  // settles it (the spec's build plan, package 6: a higher floor or text
  // that shrinks); then this tag comes off and the 1x shot keeps it fixed
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
 * A menu screen: the title along the top, a window with a heading, a
 * picker with a setting and a disabled item, its legend, and the
 * buttons under it
 */
export const Menu: Story = {
  render: () => (
    <>
      <ScreenTitle blurb="Whose side are you on today?">
        Pick a role
      </ScreenTitle>
      <div className="absolute inset-x-[calc(var(--px)*80)] top-[calc(var(--px)*44)] grid gap-[calc(var(--px)*6)] tall:inset-x-[calc(var(--px)*12)] tall:top-[calc(var(--px)*70)]">
        <Window>
          <Heading>Developer</Heading>
          <Text className="mb-[calc(var(--px)*3)]">
            Ships on Friday. Regrets nothing.
          </Text>
          <Picker label="Menu" active={false}>
            <PickerItem id="start" variant="accent" onSelect={noop}>
              Start the run
            </PickerItem>
            <PickerSetting id="music" value="On" onStep={noop}>
              Music
            </PickerSetting>
            <PickerItem
              id="hard"
              disabled
              note="Beat the Stakeholder first."
              onSelect={noop}
            >
              Hard mode
            </PickerItem>
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
        <div className="flex justify-center gap-[calc(var(--px)*4)]">
          <Button variant="secondary" size="small">
            Cancel
          </Button>
          <Button size="small">Play</Button>
        </div>
      </div>
    </>
  ),
};

/**
 * A duel: who says what in a window, the other side's bubble, the
 * pools as a ledger of meters, the clock, and the tabs of a log
 */
export const Duel: Story = {
  render: () => (
    <>
      <SpeechBubble
        side="bottom"
        align="start"
        className="absolute top-[calc(var(--px)*12)] left-[calc(var(--px)*16)] w-[calc(var(--px)*120)] tall:top-[calc(var(--px)*16)]"
      >
        Can we circle back on that after lunch?
      </SpeechBubble>
      <Timer
        duration={10000}
        remaining={4000}
        paused
        className="absolute top-[calc(var(--px)*14)] right-[calc(var(--px)*16)] tall:top-[calc(var(--px)*18)]"
      />
      <div className="absolute inset-x-[calc(var(--px)*16)] bottom-[calc(var(--px)*12)] grid grid-cols-[3fr_2fr] gap-[calc(var(--px)*6)] tall:bottom-[calc(var(--bui-bar)+var(--px)*12)] tall:grid-cols-1">
        <Window>
          <div className="grid gap-[calc(var(--px)*3)]">
            <Line variant="secondary" past>
              We need this by Monday.
            </Line>
            <Line>Monday, as in next quarter?</Line>
          </div>
        </Window>
        <Tabs variant="window" defaultValue="pools">
          <TabList aria-label="Duel">
            <Tab value="pools">Pools</Tab>
            <Tab value="log">Log</Tab>
          </TabList>
          <TabPanel value="pools">
            <Ledger
              rows={[
                [
                  'Momentum',
                  <Meter key="m" aria-label="Momentum" value={3} max={5} />,
                ],
                [
                  'Patience',
                  <Meter
                    key="p"
                    aria-label="Patience"
                    value={1}
                    max={5}
                    variant="danger"
                  />,
                ],
              ]}
            />
          </TabPanel>
          <TabPanel value="log">Nothing yet.</TabPanel>
        </Tabs>
      </div>
    </>
  ),
};
