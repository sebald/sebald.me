import { useState } from 'react';

import { useKeys } from '../../../hooks/use-keys';
import { Form } from '../../form/form';
import { Actions, Content, Title } from '../../parts/parts';
import { Picker, PickerGroup, PickerItem } from '../../picker/picker';
import { TextField } from '../../text-field/text-field';
import { Text } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { Button } from '../button';

const noop = () => {};

/**
 * Back in each kind of window: in a menu the last item, `variant="back"`
 * in a group of its own; in a form the secondary button beside the main
 * one. Esc is Back in both: the screen gives Escape the same handler
 * (`useKeys`). In a field Esc first lets go of it, the next goes back
 */
export function Back() {
  const [went, setWent] = useState(0);
  const back = () => setWent(n => n + 1);
  useKeys({ Escape: back });
  return (
    <div className="flex flex-col gap-regular">
      <div className="flex flex-wrap items-start gap-regular">
        <Window className="w-[14em]">
          <Title>Options</Title>
          <Actions>
            <Picker>
              <PickerItem id="sound" onSelect={noop}>
                Sound
              </PickerItem>
              <PickerItem id="controls" onSelect={noop}>
                Controls
              </PickerItem>
              <PickerGroup>
                <PickerItem id="back" variant="back" onSelect={back}>
                  Back
                </PickerItem>
              </PickerGroup>
            </Picker>
          </Actions>
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Esc', 'back'],
            ]}
            touch="Tap a line"
          />
        </Window>
        <Window className="w-[20em]">
          <Title>Save</Title>
          <Content>
            <Form onSubmit={noop}>
              <TextField name="name" maxLength={12} placeholder="Slot 1">
                Name
              </TextField>
              <Actions>
                <Button type="submit">Save</Button>
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
              </Actions>
            </Form>
          </Content>
          <Legend
            keys={[
              ['↑↓', 'row'],
              ['Esc', 'back'],
            ]}
            touch="Tap a field to type"
          />
        </Window>
      </div>
      <Text variant="hint">
        {went ? `Back, ${went}×.` : 'Nothing yet: pick Back or press Esc.'}
      </Text>
    </div>
  );
}
