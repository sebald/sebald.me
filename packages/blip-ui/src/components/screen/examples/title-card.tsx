import { Button } from '../../button/button';
import { Heading, Text } from '../../text/text';
import { Screen } from '../screen';

/** A title card in the frame: one group in the middle of the stage. Put it on a `Stage` */
export function TitleCard() {
  return (
    <Screen variant="centered">
      <Heading>Pushback</Heading>
      <Text>The meeting will wait.</Text>
      <Button>Start</Button>
    </Screen>
  );
}
