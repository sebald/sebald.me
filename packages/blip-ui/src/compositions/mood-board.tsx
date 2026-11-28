import type { ReactNode } from 'react';

import { BitmapText } from '../components/bitmap-text/bitmap-text';
import { Button } from '../components/button/button';
import { Form } from '../components/form/form';
import { Ledger, LedgerRow } from '../components/ledger/ledger';
import { Line } from '../components/line/line';
import { Meter } from '../components/meter/meter';
import { Actions, Content, Title } from '../components/parts/parts';
import {
  Picker,
  PickerGroup,
  PickerItem,
  PickerSetting,
} from '../components/picker/picker';
import { PixelIcon } from '../components/pixel-icon/pixel-icon';
import { Readout } from '../components/readout/readout';
import { SpeechBubble } from '../components/speech-bubble/speech-bubble';
import { Stamp } from '../components/stamp/stamp';
import { Stepper } from '../components/stepper/stepper';
import { Tab, TabList, TabPanel, Tabs } from '../components/tabs/tabs';
import { TextField } from '../components/text-field/text-field';
import { Heading, Text } from '../components/text/text';
import { Timer } from '../components/timer/timer';
import { Typewriter } from '../components/typewriter/typewriter';
import { Legend, Window } from '../components/window/window';

const noop = () => {};

/** One group of the board: its window, and under it what the group is for */
const Group = ({
  caption,
  noted = false,
  children,
}: {
  caption: ReactNode;
  /** Its menu shows a note beside it: across both columns, the window and its caption in the left half and the note in the right; on a phone, room under the window, where the note goes */
  noted?: boolean;
  children: ReactNode;
}) => (
  <section
    className={
      noted
        ? 'grid content-start gap-related [column-span:all] *:w-[calc((100%-var(--spacing-section))/2)] tall:*:w-full'
        : 'grid content-start gap-related'
    }
  >
    {noted ? (
      <div className="tall:pb-[calc(var(--px)*60)]">{children}</div>
    ) : (
      children
    )}
    <Text variant="hint">{caption}</Text>
  </section>
);

/**
 * The kit on one sheet, by what the player does with each part: choose,
 * set and type, act, read, hear, and the words and art around them.
 * Each group says what it is for and how its parts show the focus, so a
 * change to one part is seen beside all the others. The Form's first
 * stepper has the focus (the story's `play`); a page shows only one
 */
export function MoodBoard() {
  return (
    <div className="columns-2 gap-section *:mb-section *:break-inside-avoid tall:columns-1">
      <Group
        noted
        caption="Choose: a menu, a place or an action. Focus: the cursor on the row, a setting's arrows on that row only, and every row's note in a window beside the menu."
      >
        <Window>
          <Title>Menu</Title>
          <Actions>
            <Picker initial="mode">
              <PickerItem
                id="new"
                variant="accent"
                note="Start over from the first act."
                onSelect={noop}
              >
                New run
              </PickerItem>
              <PickerItem
                id="continue"
                note="Act two, three duels won."
                onSelect={noop}
              >
                Continue
              </PickerItem>
              <PickerSetting
                id="mode"
                value="Normal"
                note="Ghosts help you; nothing rushes you."
                onStep={noop}
              >
                Mode
              </PickerSetting>
              <PickerItem
                id="erase"
                disabled
                note="Nothing to erase yet."
                onSelect={noop}
              >
                Erase save
              </PickerItem>
              <PickerGroup>
                <PickerItem
                  id="back"
                  variant="back"
                  note="To the title."
                  onSelect={noop}
                >
                  Back
                </PickerItem>
              </PickerGroup>
            </Picker>
          </Actions>
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
            ]}
            touch="Tap a line"
          />
        </Window>
      </Group>

      <Group caption="Set and type: a form. Focus: the cursor at the label; a stepper's arrows, bright, and a text field's underline as its second cue; a button's cursor.">
        <Window>
          <Title>Form</Title>
          <Content>
            <Form>
              <Stepper values={['Off', 'On']} defaultValue="On">
                Music
              </Stepper>
              <Stepper
                values={['Slow', 'Normal', 'Fast']}
                defaultValue="Normal"
                description="How fast lines are written out."
              >
                Text speed
              </Stepper>
              <Stepper
                values={['Normal', 'Hard']}
                defaultValue="Hard"
                error="Hard needs the first act beaten."
              >
                Difficulty
              </Stepper>
              <Stepper values={['Off', 'On']} disabled>
                Locked
              </Stepper>
              <TextField
                maxLength={10}
                defaultValue="Mira"
                description="Shown on the save."
              >
                Hero
              </TextField>
              <TextField
                maxLength={4}
                defaultValue="M"
                error="Three or four letters."
              >
                Tag
              </TextField>
              <TextField placeholder="Empty" disabled>
                Note
              </TextField>
              <Actions>
                <Button type="submit">Save</Button>
                <Button variant="secondary">Back</Button>
              </Actions>
            </Form>
          </Content>
          <Legend
            keys={[
              ['↑↓', 'row'],
              ['←→', 'change'],
            ]}
            touch="Tap a row to change it"
          />
        </Window>
      </Group>

      <Group caption="Act: buttons in their variants and sizes, two to a row. Focus: the cursor left of the button.">
        <Window>
          <Title>Buttons</Title>
          <Content>
            <Actions>
              <Button>Start</Button>
              <Button variant="secondary">Back</Button>
            </Actions>
            <Actions>
              <Button variant="destructive">Erase</Button>
              <Button disabled>Locked</Button>
            </Actions>
            <Actions>
              <Button size="small">Sell</Button>
              <Button size="small" variant="secondary">
                Keep
              </Button>
            </Actions>
          </Content>
        </Window>
      </Group>

      <Group caption="Read: numbers and states the player only reads. No focus: none of them takes it.">
        <Window>
          <Title>Status</Title>
          <Content>
            <Readout value={120}>Gold</Readout>
            <Readout value={42} max={50}>
              HP
            </Readout>
            <Ledger>
              <LedgerRow label="Momentum">
                <Meter aria-label="Momentum" value={3} max={5} />
              </LedgerRow>
              <LedgerRow label="Their momentum">
                <Meter
                  aria-label="Their momentum"
                  value={2}
                  max={5}
                  variant="secondary"
                />
              </LedgerRow>
              <LedgerRow label="Score">4,200</LedgerRow>
            </Ledger>
            <div className="flex items-center gap-regular">
              <Timer duration={10_000} remaining={6_000} />
              <Stamp word="DONE" />
              <Stamp word="FAIL" variant="danger" />
            </div>
          </Content>
        </Window>
      </Group>

      <Group caption="Speak: who says what, a line being typed, a bubble over a speaker. No focus.">
        <Window>
          <Title>Lines</Title>
          <Content>
            <Line variant="secondary" past>
              Let’s take this offline.
            </Line>
            <Line variant="primary">Offline is where ideas go to die.</Line>
            <Line variant="secondary">
              <Typewriter typed={24}>
                {"Let's circle back next sprint."}
              </Typewriter>
            </Line>
          </Content>
        </Window>
        <SpeechBubble className="w-fit justify-self-end" offset={6}>
          Over here.
        </SpeechBubble>
      </Group>

      <Group caption="Pages: a window with tabs, the window itself. Focus: a tab's underline, a panel's frame.">
        <Tabs defaultValue="pools">
          <TabList aria-label="Duel">
            <Tab value="pools">Pools</Tab>
            <Tab value="log">Log</Tab>
          </TabList>
          <TabPanel value="pools">
            <Text>Momentum 3, theirs 1.</Text>
          </TabPanel>
          <TabPanel value="log">
            <Text>Nothing yet.</Text>
          </TabPanel>
        </Tabs>
      </Group>

      <Group caption="Words and art: headings, text, icons and bitmap letters. No focus.">
        <Window>
          <Title>Text</Title>
          <Content>
            <Heading>Your run as the PM</Heading>
            <Text>Plain text, as the window says it.</Text>
            <Text variant="hint">A hint, quieter.</Text>
            <Text variant="call">Press Enter to play</Text>
            <div className="flex items-center gap-regular">
              <PixelIcon icon="back" />
              <PixelIcon icon="pause" />
              <PixelIcon icon="soundOn" />
              <BitmapText>WIN</BitmapText>
              <BitmapText variant="spark">FLAWLESS</BitmapText>
            </div>
          </Content>
        </Window>
      </Group>
    </div>
  );
}
