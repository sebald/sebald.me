import { Content, Title } from '../../parts/parts';
import { Readout } from '../../readout/readout';
import { Switch } from '../../switch/switch';
import { Window } from '../../window/window';
import { TextField } from '../text-field';

/**
 * Rows of an options screen: the window's `Content` gives them one label
 * column and the gap between rows, so the names of a switch, a readout and
 * a field line up and the field takes the rest of its row. On a tall
 * stage the labels stack above their fields instead
 */
export function OptionsRows() {
  return (
    <Window>
      <Title>Your game</Title>
      <Content>
        <Switch defaultChecked>Music</Switch>
        <Switch defaultChecked={false}>Hard mode</Switch>
        <Readout value={120}>Gold</Readout>
        <TextField
          defaultValue="Mira"
          maxLength={8}
          placeholder="Hero"
          description="Shown on the save."
        >
          Hero
        </TextField>
        <TextField
          defaultValue="M"
          maxLength={4}
          placeholder="Tag"
          error="Three or four letters."
        >
          Team tag
        </TextField>
      </Content>
    </Window>
  );
}
