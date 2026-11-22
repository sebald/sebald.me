import { useState } from 'react';

import { Content } from '../../parts/parts';
import { Picker, PickerItem } from '../../picker/picker';
import { Heading, Text } from '../../text/text';
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
      <Heading>New game</Heading>
      <Content className="mt-[calc(var(--bui-px)*3)]">
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
      </Content>
      <Picker label="New game" className="mt-[calc(var(--bui-px)*4)]">
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
      {started && (
        <Text className="mt-[calc(var(--bui-px)*3)]">
          {name.trim()} sets out.
        </Text>
      )}
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
