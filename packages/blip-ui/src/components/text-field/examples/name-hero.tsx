import { useState } from 'react';

import { Button } from '../../button/button';
import { Form } from '../../form/form';
import { Actions, Content, Title } from '../../parts/parts';
import { Text } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { TextField } from '../text-field';

/**
 * Naming the hero before a run: a form window, the field and the buttons
 * under it in a `Form`, no menu (a window is a menu or a form). Type a
 * name, Enter takes it; Down goes to the buttons, Left and Right between
 * them; Start does the same as Enter, Clear empties the field
 */
export function NameHero() {
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  return (
    <Window>
      <Title>New game</Title>
      <Content>
        <Form onSubmit={() => setStarted(name.trim() !== '')}>
          <TextField
            maxLength={10}
            placeholder="Hero"
            autoComplete="off"
            description="Up to ten letters."
            value={name}
            onValueChange={setName}
          >
            Name
          </TextField>
          {started && <Text>{name.trim()} sets out.</Text>}
          <Actions>
            <Button type="submit">Start</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setName('');
                setStarted(false);
              }}
            >
              Clear
            </Button>
          </Actions>
        </Form>
      </Content>
      <Legend
        keys={[
          ['↑↓', 'row'],
          ['Enter', 'take the name'],
        ]}
        touch="Tap the field to type"
      />
    </Window>
  );
}
