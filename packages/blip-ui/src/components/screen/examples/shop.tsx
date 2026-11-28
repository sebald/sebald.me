import { Actions, Title } from '../../parts/parts';
import { Picker, PickerGroup, PickerItem } from '../../picker/picker';
import { ScreenTitle } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { Screen } from '../screen';

const noop = () => {};

/**
 * A menu screen in the frame: the title first, a window with the choices
 * under it, the legend last. No position, inset or bar of its own: put it
 * on a `Stage`
 */
export function Shop() {
  return (
    <Screen>
      <ScreenTitle>Shop</ScreenTitle>
      <Window>
        <Title>Gold: 120</Title>
        <Actions>
          <Picker label="Shop">
            <PickerItem id="coffee" onSelect={noop}>
              Coffee
            </PickerItem>
            <PickerItem id="desk" onSelect={noop}>
              Standing desk
            </PickerItem>
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
          touch="Tap a line"
        />
      </Window>
    </Screen>
  );
}
