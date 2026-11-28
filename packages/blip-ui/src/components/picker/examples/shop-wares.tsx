import { Actions, Title } from '../../parts/parts';
import { Tag } from '../../tag/tag';
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
 * A shop's wares: each its name and its price at the row's end. One the
 * player can't afford is there, dimmed with its price, and says how much
 * is missing, so it reads at a glance
 */
export function ShopWares() {
  return (
    // Upright the note goes under the window: room for it below
    <div className="tall:pb-[9em]">
      <Window>
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
              <Tag>New</Tag>
              <PickerItemValue>12g</PickerItemValue>
            </PickerItem>
            <PickerItem
              id="rope"
              disabled
              note="15g short. Sell something first: it is strong enough for a ferry."
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
