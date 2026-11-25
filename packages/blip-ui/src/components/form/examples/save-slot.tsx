import { useState } from 'react';

import { Button } from '../../button/button';
import { Actions, Content, Title } from '../../parts/parts';
import { TextField } from '../../text-field/text-field';
import { Text } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { Form } from '../form';

/**
 * Naming a save: a form window whose rows the arrows move through with no
 * key code of the game's own. Down goes from the name to the note to the
 * buttons and round again, Left and Right between the buttons, Enter in a
 * field saves, Esc lets go of a field
 */
export function SaveSlot() {
  const [saved, setSaved] = useState('');
  return (
    <Window>
      <Title>Save</Title>
      <Content>
        <Form
          onSubmit={data =>
            setSaved(`Saved as ${String(data.get('name')) || 'Slot 1'}.`)
          }
        >
          <TextField
            name="name"
            maxLength={12}
            placeholder="Slot 1"
            autoComplete="off"
          >
            Name
          </TextField>
          <TextField
            name="note"
            maxLength={24}
            placeholder="Before the boss"
            autoComplete="off"
            description="A line to find it by."
          >
            Note
          </TextField>
          {saved && <Text>{saved}</Text>}
          <Actions>
            <Button type="submit">Save</Button>
            <Button variant="secondary" onClick={() => setSaved('')}>
              Back
            </Button>
          </Actions>
        </Form>
      </Content>
      <Legend
        keys={[
          ['↑↓', 'row'],
          ['←→', 'button'],
          ['Enter', 'save'],
        ]}
        touch="Tap a field to type"
      />
    </Window>
  );
}
