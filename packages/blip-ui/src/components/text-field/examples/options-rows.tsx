import { Content } from '../../parts/parts';
import { Readout } from '../../readout/readout';
import { Switch } from '../../switch/switch';
import { Heading } from '../../text/text';
import { Window } from '../../window/window';
import { TextField } from '../text-field';

/**
 * Rows of an options screen: the window's `Content` gives them one label
 * column, so the names of a switch, a readout and a field line up and the
 * field takes the rest of its row. On a tall stage the labels stack above
 * their fields instead
 */
export function OptionsRows() {
  return (
    <Window>
      <Heading>Your game</Heading>
      <Content className="mt-[calc(var(--bui-px)*3)] grid gap-[calc(var(--bui-px)*4)]">
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
