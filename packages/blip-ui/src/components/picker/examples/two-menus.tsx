import { Actions, Title } from '../../parts/parts';
import { Window } from '../../window/window';
import { Picker, PickerItem } from '../picker';

const noop = () => {};

/**
 * Two menus on one screen, each named by its window's title: the keys
 * go to the one the player clicked or moved the focus into, and until
 * then to the first
 */
export function TwoMenus() {
  return (
    <div className="flex flex-wrap gap-regular">
      <Window>
        <Title>Party</Title>
        <Actions>
          <Picker>
            <PickerItem id="status" onSelect={noop}>
              Status
            </PickerItem>
            <PickerItem id="equip" onSelect={noop}>
              Equip
            </PickerItem>
          </Picker>
        </Actions>
      </Window>
      <Window>
        <Title>Bag</Title>
        <Actions>
          <Picker>
            <PickerItem id="use" onSelect={noop}>
              Use
            </PickerItem>
            <PickerItem id="drop" onSelect={noop}>
              Drop
            </PickerItem>
          </Picker>
        </Actions>
      </Window>
    </div>
  );
}
