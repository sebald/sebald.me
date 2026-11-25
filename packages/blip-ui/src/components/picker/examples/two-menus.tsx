import { Heading } from '../../text/text';
import { Window } from '../../window/window';
import { Picker, PickerItem } from '../picker';

const noop = () => {};

/**
 * Two menus on one screen: the keys go to the one the player clicked or
 * moved the focus into, and until then to the first
 */
export function TwoMenus() {
  return (
    <div className="flex flex-wrap gap-regular">
      <Window className="w-[12em]">
        <Heading>Party</Heading>
        <Picker label="Party" className="mt-regular">
          <PickerItem id="status" onSelect={noop}>
            Status
          </PickerItem>
          <PickerItem id="equip" onSelect={noop}>
            Equip
          </PickerItem>
        </Picker>
      </Window>
      <Window className="w-[12em]">
        <Heading>Bag</Heading>
        <Picker label="Bag" className="mt-regular">
          <PickerItem id="use" onSelect={noop}>
            Use
          </PickerItem>
          <PickerItem id="drop" onSelect={noop}>
            Drop
          </PickerItem>
        </Picker>
      </Window>
    </div>
  );
}
