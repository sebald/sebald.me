import { Actions, Title } from '../../parts/parts';
import { Legend, Window } from '../../window/window';
import {
  Picker,
  PickerGroup,
  PickerItem,
  PickerItemDetail,
  PickerItemMark,
  PickerItemValue,
} from '../picker';

const noop = () => {};

/**
 * A shop's wares: each its name and its price at the row's end. One the
 * player can't afford is there, dimmed with its price, and says how much
 * is missing, so it reads at a glance
 */
export function ShopWares() {
  return (
    // Upright the note goes under the window: room for it below
    <div className="tall:pb-[9em]">
      <Window className="w-[22em] tall:w-full">
        <Title>Wares · 30g</Title>
        <Actions>
          <Picker>
            <PickerItem
              id="tonic"
              note="Heals a little. Tastes of pine."
              onSelect={noop}
            >
              Tonic
              <PickerItemValue>25g</PickerItemValue>
            </PickerItem>
            <PickerItem
              id="lantern"
              note="Lights the way after dark."
              onSelect={noop}
            >
              Lantern
              <PickerItemMark>New</PickerItemMark>
              <PickerItemValue>12g</PickerItemValue>
            </PickerItem>
            <PickerItem
              id="rope"
              disabled
              note="Strong enough for a ferry. Sell something first."
              onSelect={noop}
            >
              Rope
              <PickerItemValue>45g</PickerItemValue>
              <PickerItemDetail>15g short</PickerItemDetail>
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
          touch="Tap a ware"
        />
      </Window>
    </div>
  );
}
