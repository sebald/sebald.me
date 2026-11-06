import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { Pixels, usePixels } from '../../providers/pixels';
import { Button } from '../button/button';
import { Actions, Content, Title } from '../parts/parts';
import { Picker, PickerItem, PickerSetting } from '../picker/picker';
import { Heading, Text } from '../text/text';
import { Legend } from '../window/window';
import { Dialog } from './dialog';

const noop = () => {};

/** A stage to cover, in stage pixels; at least as big in em as its text needs (text has a floor, so at 1x it needs more room than the stage pixels give) */
const Stage = ({ children }: { children: ReactNode }) => {
  const pixels = usePixels();
  return (
    <Pixels
      {...pixels}
      className="overflow-hidden bg-(--bui-ground) p-[calc(var(--bui-px)*6)] text-(--bui-text)"
      style={{
        width: `max(calc(var(--px) * 320), 30em)`,
        height: `max(calc(var(--px) * ${pixels.tall ? 400 : 180}), 18em)`,
      }}
    >
      {children}
    </Pixels>
  );
};

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  // Open, so there is something to see; the rest are the defaults
  args: { defaultOpen: true, role: 'dialog', size: 'default', children: null },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    role: {
      control: 'inline-radio',
      options: ['dialog', 'alertdialog'],
      table: { defaultValue: { summary: 'dialog' } },
    },
    size: {
      control: 'inline-radio',
      options: ['default', 'large'],
      table: { defaultValue: { summary: 'default' } },
    },
    open: { control: false },
    onOpenChange: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Over a menu: the dialog has the keys while it is open, the menu under
 * it hears none. Escape or a tap outside closes it; Options opens it again
 */
export const Default: Story = {
  decorators: [
    Story => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
  render: function Render(args) {
    const [open, setOpen] = useState(args.defaultOpen ?? false);
    const [music, setMusic] = useState(true);
    return (
      <>
        <Heading>Menu</Heading>
        <Picker label="Menu" className="mt-[calc(var(--bui-px)*3)]">
          <PickerItem id="start" variant="accent" onSelect={noop}>
            Start
          </PickerItem>
          <PickerItem id="options" onSelect={() => setOpen(true)}>
            Options
          </PickerItem>
        </Picker>
        <Dialog {...args} open={open} onOpenChange={setOpen}>
          <Title>Options</Title>
          <Actions>
            <Picker label="Options">
              <PickerSetting
                id="music"
                value={music ? 'On' : 'Off'}
                onStep={() => setMusic(!music)}
              >
                Music
              </PickerSetting>
              <PickerItem
                id="back"
                variant="back"
                onSelect={() => setOpen(false)}
              >
                Back
              </PickerItem>
            </Picker>
          </Actions>
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
              ['Esc', 'back'],
            ]}
            touch="Tap a line"
          />
        </Dialog>
      </>
    );
  },
};

/** Both sizes, and every part: a title, what it says, what can be done, a legend */
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
        <Dialog defaultOpen>
          <Title>Leave the duel?</Title>
          <Content>
            <Text>The round so far is lost.</Text>
          </Content>
          <Actions>
            <Button variant="secondary" size="small">
              Stay
            </Button>
            <Button size="small">Leave</Button>
          </Actions>
        </Dialog>
      </Stage>
      <Stage>
        <Dialog defaultOpen size="large">
          <Title>How it works</Title>
          <Content>
            <ol className="m-0 grid list-none gap-[calc(var(--bui-px)*2)] p-0">
              <li>
                1. They say something. You answer before the clock runs out.
              </li>
              <li>2. A good answer moves the beam your way.</li>
              <li>3. Push it all the way and the meeting is yours.</li>
            </ol>
          </Content>
          <Legend keys={[['Esc', 'close']]} touch="Tap outside" />
        </Dialog>
      </Stage>
    </>
  ),
};
