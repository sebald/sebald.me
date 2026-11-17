import { Stage } from '@sebald/blip-ui';

import { FIXTURES, type FixtureName } from './game/data';
import { openFixture } from './game/state';
import { screens } from './screens';

// `?screen=<name>&state=<fixture>` opens a screen on a game state; the
// defaults are the camp on `start`
const query = new URLSearchParams(window.location.search);
const screenName = query.get('screen') ?? 'camp';
const stateName = query.get('state') ?? 'start';

openFixture(stateName in FIXTURES ? (stateName as FixtureName) : 'start');

export const App = () => {
  const Screen = screens[screenName];
  return (
    <Stage
      label="Ford"
      turned={<p>Turn your phone upright to play.</p>}
      small={<p>Make the window bigger to play.</p>}
    >
      {Screen ? (
        <Screen />
      ) : (
        <Stage.Center>No screen called “{screenName}”</Stage.Center>
      )}
    </Stage>
  );
};
