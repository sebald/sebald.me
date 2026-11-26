import { Actions, Title } from '../../parts/parts';
import { Picker, PickerGroup, PickerItem } from '../../picker/picker';
import { Legend, Window } from '../window';

const noop = () => {};

/**
 * A window that is a menu: its title, one list and the list's keys. The
 * title is the list's name, for a screen reader too, so the Picker has
 * no label of its own
 */
export function AMenu() {
  return (
    <Window>
      <Title>Inventory</Title>
      <Actions>
        <Picker>
          <PickerItem id="use" onSelect={noop}>
            Use
          </PickerItem>
          <PickerItem id="sort" onSelect={noop}>
            Sort
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
          ['Enter', 'confirm'],
        ]}
        touch="Tap a line"
      />
    </Window>
  );
}
