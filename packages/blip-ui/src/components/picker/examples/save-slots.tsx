import { Actions, Title } from '../../parts/parts';
import { Legend, Window } from '../../window/window';
import {
  Picker,
  PickerGroup,
  PickerItem,
  PickerItemDetail,
  PickerItemValue,
} from '../picker';

const noop = () => {};

/**
 * Save slots to load from: each its place, the play time at the end, and
 * who leads the party and when it was saved under them. An empty slot is
 * there, dimmed, and says why it can't be loaded
 */
export function SaveSlots() {
  return (
    // Upright the note goes under the window: room for it below
    <div className="tall:pb-[9em]">
      <Window>
        <Title>Load</Title>
        <Actions>
          <Picker>
            <PickerItem id="slot-1" onSelect={noop}>
              Hollow Gate
              <PickerItemValue>3:25</PickerItemValue>
              <PickerItemDetail>Rowan, level 4 · today</PickerItemDetail>
            </PickerItem>
            <PickerItem id="slot-2" onSelect={noop}>
              The mill
              <PickerItemValue>2:01</PickerItemValue>
              <PickerItemDetail>Rowan, level 3 · yesterday</PickerItemDetail>
            </PickerItem>
            <PickerItem
              id="slot-3"
              disabled
              note="Nothing saved in this slot."
              onSelect={noop}
            >
              Empty
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
            ['Enter', 'load'],
          ]}
          touch="Tap a slot"
        />
      </Window>
    </div>
  );
}
