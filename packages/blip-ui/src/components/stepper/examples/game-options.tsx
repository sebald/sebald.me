import { useState } from 'react';

import { Button } from '../../button/button';
import { Form } from '../../form/form';
import { Actions, Content, Title } from '../../parts/parts';
import { Text } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { Stepper } from '../stepper';

/**
 * A game's options as a form window: every choice is a stepper, two
 * values (Music, Hints) or more (Speed). Up and Down go from row to row
 * and on to the buttons, Left and Right change the value; Save sends the
 * form with each stepper's value by its `name`
 */
export function GameOptions() {
  const [saved, setSaved] = useState('');
  return (
    <Window>
      <Title>Options</Title>
      <Content>
        <Form
          onSubmit={data =>
            setSaved(
              `Music ${String(data.get('music'))}, ${String(data.get('speed'))} text.`,
            )
          }
        >
          <Stepper name="music" values={['Off', 'On']} defaultValue="On">
            Music
          </Stepper>
          <Stepper
            name="speed"
            values={['Slow', 'Normal', 'Fast']}
            defaultValue="Normal"
            description="How fast lines are written out."
          >
            Text speed
          </Stepper>
          <Stepper name="hints" values={['Off', 'On']}>
            Hints
          </Stepper>
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
          ['←→', 'change'],
        ]}
        touch="Tap a row to change it"
      />
    </Window>
  );
}
