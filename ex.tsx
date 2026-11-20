import { useState } from 'react';

import {
  Heading,
  Legend,
  Picker,
  PickerItem,
  Text,
  TextField,
} from '@sebald/blip-ui';

/**
 * Naming the hero before a run: type a name, Enter takes it, Escape gives
 * the keys to the menu under it, whose arrows and Enter work again
 */
export function NameHero() {
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  return (
    <>
      <Heading>New game</Heading>
      <TextField
        className="mt-[calc(var(--bui-px)*3)] w-[min(100%,calc(var(--px)*120))]"
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
    </>
  );
}
