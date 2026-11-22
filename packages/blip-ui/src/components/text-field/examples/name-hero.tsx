import { useState } from 'react';

import { Actions, Content, Title } from '../../parts/parts';
import { Picker, PickerItem } from '../../picker/picker';
import { Text } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { TextField } from '../text-field';

/**
 * Naming the hero before a run: type a name, Enter takes it, Escape gives
 * the keys to the menu under it, whose arrows and Enter work again
 */
export function NameHero() {
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
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
          onSubmit={() => setStarted(name.trim() !== '')}
        >
          Name
        </TextField>
        {started && <Text>{name.trim()} sets out.</Text>}
      </Content>
      <Actions>
        <Picker label="New game">
          <PickerItem
            id="start"
            variant="accent"
            onSelect={() => setStarted(name.trim() !== '')}
          >
            Start
          </PickerItem>
          <PickerItem id="back" variant="back" onSelect={() => setName('')}>
            Clear
          </PickerItem>
        </Picker>
      </Actions>
      <Legend
        keys={[
          ['Enter', 'take the name'],
          ['Esc', 'to the menu'],
        ]}
        touch="Tap the field to type"
      />
    </Window>
  );
}
