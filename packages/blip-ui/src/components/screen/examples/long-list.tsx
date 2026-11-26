import { Actions, Title } from '../../parts/parts';
import { Picker, PickerGroup, PickerItem } from '../../picker/picker';
import { ScreenTitle } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { Screen } from '../screen';

const noop = () => {};

const WARES = [
  'Coffee',
  'Standing desk',
  'Noise-cancelling headphones',
  'Second monitor',
  'Rubber duck',
  'Whiteboard',
  'Sticky notes',
  'Ergonomic chair',
  'Plant',
  'Lamp',
  'Snacks',
];

/**
 * More rows than the stage has room for: the window's list takes the
 * room that is left and scrolls, the title, the window's title and the
 * legend stay. The arrows keep the cursor's row in view, at once
 */
export function LongList() {
  return (
    <Screen>
      <ScreenTitle>Shop</ScreenTitle>
      <Window>
        <Title>Wares</Title>
        <Actions>
          <Picker>
            {WARES.map(ware => (
              <PickerItem key={ware} id={ware} onSelect={noop}>
                {ware}
              </PickerItem>
            ))}
            <PickerGroup>
              <PickerItem id="back" variant="back" onSelect={noop}>
                Back
              </PickerItem>
            </PickerGroup>
          </Picker>
        </Actions>
        <Legend
          keys={[
            ['↑↓', 'choose'],
            ['Enter', 'buy'],
          ]}
          touch="Tap a line, drag to scroll"
        />
      </Window>
    </Screen>
  );
}
