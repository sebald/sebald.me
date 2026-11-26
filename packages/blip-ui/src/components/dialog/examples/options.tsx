import { type ComponentProps, useState } from 'react';

import { Actions, Content, Title } from '../../parts/parts';
import { Picker, PickerItem, PickerSetting } from '../../picker/picker';
import { Heading } from '../../text/text';
import { Legend } from '../../window/window';
import { Dialog } from '../dialog';

const noop = () => {};

/**
 * Over a menu: the dialog has the keys while it is open, the menu under
 * it hears none. Escape or a tap outside closes it; Options opens it again
 */
export function Options(props: Partial<ComponentProps<typeof Dialog>>) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const [music, setMusic] = useState(true);
  return (
    <>
      <Content>
        <Heading>Menu</Heading>
        <Picker label="Menu">
          <PickerItem id="start" variant="accent" onSelect={noop}>
            Start
          </PickerItem>
          <PickerItem id="options" onSelect={() => setOpen(true)}>
            Options
          </PickerItem>
        </Picker>
      </Content>
      <Dialog {...props} open={open} onOpenChange={setOpen}>
        <Title>Options</Title>
        <Actions>
          <Picker>
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
}
