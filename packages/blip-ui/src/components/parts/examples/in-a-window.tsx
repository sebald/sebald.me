import { Button } from '../../button/button';
import { Text } from '../../text/text';
import { Window } from '../../window/window';
import { Actions, Content, Title, type PartProps } from '../parts';

/** The three parts in a window, which places them */
export function InAWindow(props: PartProps) {
  return (
    <Window>
      <Title {...props} />
      <Content>
        <Text>The round so far is lost.</Text>
      </Content>
      <Actions>
        <Button variant="secondary" size="small">
          Stay
        </Button>
        <Button size="small">Leave</Button>
      </Actions>
    </Window>
  );
}
