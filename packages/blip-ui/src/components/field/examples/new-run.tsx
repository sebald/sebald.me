import { useState } from 'react';

import { Button } from '../../button/button';
import { Actions, Content, Title } from '../../parts/parts';
import { TextField, TextInput } from '../../text-field/text-field';
import { Legend, Window } from '../../window/window';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';

/**
 * A new run's form: the hero's name as a `TextField`, and the run's seed
 * as a `Field` composed by hand, its error there only while the seed is
 * not a number. Both labels share the window's label column
 */
export function NewRun() {
  const [seed, setSeed] = useState('1987');
  const wrong = !/^\d*$/.test(seed);
  return (
    <Window>
      <Title>New run</Title>
      <Content>
        <TextField
          maxLength={10}
          placeholder="Hero"
          autoComplete="off"
          defaultValue="Mira"
        >
          Name
        </TextField>
        <Field>
          <FieldLabel>Seed</FieldLabel>
          <TextInput
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={seed}
            onValueChange={setSeed}
          />
          <FieldDescription>Leave it empty for a random run.</FieldDescription>
          {wrong && <FieldError>Digits only, such as 1987.</FieldError>}
        </Field>
      </Content>
      <Actions>
        <Button>Start</Button>
      </Actions>
      <Legend
        keys={[
          ['Enter', 'take it'],
          ['Tab', 'next'],
        ]}
        touch="Tap a field to type"
      />
    </Window>
  );
}
