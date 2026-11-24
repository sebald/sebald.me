import { useState } from 'react';

import { Button } from '../../button/button';
import { Actions, Content, Title } from '../../parts/parts';
import { Text } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { TextField } from '../text-field';

/**
 * Naming the hero before a run: a form window, the field and the buttons
 * under it, no menu (a window is a menu or a form). Type a name, Enter
 * takes it; Start does the same, Clear empties the field
 */
export function NameHero() {
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  const start = () => setStarted(name.trim() !== '');
  return (
    <Window>
      <Title>New game</Title>
      <Content>
        <TextField
          maxLength={10}
          placeholder="Hero"
          autoComplete="off"
          description="Up to ten letters."
          value={name}
          onValueChange={setName}
          onSubmit={start}
        >
          Name
        </TextField>
        {started && <Text>{name.trim()} sets out.</Text>}
      </Content>
      <Actions>
        <Button onClick={start}>Start</Button>
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
      <Legend
        keys={[
          ['Enter', 'take the name'],
          ['Tab', 'next'],
        ]}
        touch="Tap the field to type"
      />
    </Window>
  );
}
