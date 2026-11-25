import { useState } from 'react';

import { Button } from '../../button/button';
import { Form } from '../../form/form';
import { Actions, Content, Title } from '../../parts/parts';
import { TextField, TextInput } from '../../text-field/text-field';
import { Text } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';

/**
 * A new run's form: the hero's name as a `TextField`, and the run's seed
 * as a `Field` composed by hand, its error there only while the seed is
 * not a number. Both labels share the window's label column. In a
 * `Form`: Up and Down move between the rows, Enter starts
 */
export function NewRun() {
  const [seed, setSeed] = useState('1987');
  const [started, setStarted] = useState('');
  const wrong = !/^\d*$/.test(seed);
  const start = (data: FormData) => {
    if (!wrong)
      setStarted(`${data.get('hero')} sets out, seed ${seed || 'random'}.`);
  };
  return (
    <Window>
      <Title>New run</Title>
      <Content>
        <Form onSubmit={start}>
          <TextField
            maxLength={10}
            placeholder="Hero"
            autoComplete="off"
            name="hero"
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
            <FieldDescription>
              Leave it empty for a random run.
            </FieldDescription>
            {wrong && <FieldError>Digits only, such as 1987.</FieldError>}
          </Field>
          {started && <Text>{started}</Text>}
          <Actions>
            <Button type="submit">Start</Button>
          </Actions>
        </Form>
      </Content>
      <Legend
        keys={[
          ['↑↓', 'row'],
          ['Enter', 'start'],
        ]}
        touch="Tap a field to type"
      />
    </Window>
  );
}
