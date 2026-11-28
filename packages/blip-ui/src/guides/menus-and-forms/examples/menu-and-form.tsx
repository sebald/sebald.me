import { useState } from 'react';

import { Button } from '../../../components/button/button';
import { Form } from '../../../components/form/form';
import { Actions, Content, Title } from '../../../components/parts/parts';
import {
  Picker,
  PickerGroup,
  PickerItem,
  PickerSetting,
} from '../../../components/picker/picker';
import { Screen } from '../../../components/screen/screen';
import { Stepper } from '../../../components/stepper/stepper';
import { TextField } from '../../../components/text-field/text-field';
import { Legend, Window } from '../../../components/window/window';
import { useKeys } from '../../../hooks/use-keys';

const noop = () => {};

/**
 * One menu window and one form window on a screen. The menu is a Picker:
 * a row to go somewhere, a setting stepped by Left and Right, Back last.
 * The form is a Form of fields: a name to type, a stepper for each choice,
 * Save and Back as buttons. No key code of the game's own: the Picker and
 * the Form move by Up and Down, change by Left and Right, and share the
 * arrows by the one the player last pointed at or tapped
 */
export function MenuAndForm() {
  const [sound, setSound] = useState(true);
  // Esc is the screen's back, the same as each window's Back
  useKeys({ Escape: noop });
  return (
    <Screen variant="split">
      <Window>
        <Title>Camp</Title>
        <Actions>
          <Picker>
            <PickerItem id="rest" onSelect={noop}>
              Rest
            </PickerItem>
            <PickerSetting
              id="sound"
              value={sound ? 'On' : 'Off'}
              onStep={() => setSound(!sound)}
            >
              Sound
            </PickerSetting>
            <PickerGroup>
              <PickerItem id="back" variant="back" onSelect={noop}>
                Back
              </PickerItem>
            </PickerGroup>
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
      </Window>
      <Window>
        <Title>New hero</Title>
        <Content>
          <Form onSubmit={noop}>
            <TextField name="name" maxLength={12} autoComplete="off">
              Name
            </TextField>
            <Stepper name="class" values={['Scout', 'Smith', 'Sage']}>
              Class
            </Stepper>
            <Stepper name="hints" values={['Off', 'On']} defaultValue="On">
              Hints
            </Stepper>
            <Actions>
              <Button type="submit">Save</Button>
              <Button variant="secondary" onClick={noop}>
                Back
              </Button>
            </Actions>
          </Form>
        </Content>
        <Legend
          keys={[
            ['↑↓', 'row'],
            ['←→', 'change'],
            ['Enter', 'save'],
            ['Esc', 'back'],
          ]}
          touch="Tap a row"
        />
      </Window>
    </Screen>
  );
}
