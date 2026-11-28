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
 * A shop whose wares have two values, the price and how many the player
 * owns: the Picker's `columns` name them over the list, each row's values
 * line up under their names, and a screen reader hears `Tonic Price 25g
 * Owned 3`. A ware out of reach is there, dimmed, with what it is short
 */
export function ShopColumns() {
  return (
    // Upright the note goes under the window: room for it below
    <div className="tall:pb-[9em]">
      <Window className="w-[24em] tall:w-full">
        <Title>Wares · 30g</Title>
        <Actions>
          <Picker columns={['Item', 'Price', 'Owned']}>
            <PickerItem
              id="tonic"
              note="Heals a little. Tastes of pine."
              onSelect={noop}
            >
              Tonic
              <PickerItemValue>25g</PickerItemValue>
              <PickerItemValue>3</PickerItemValue>
            </PickerItem>
            <PickerItem
              id="lantern"
              note="Lights the way after dark."
              onSelect={noop}
            >
              Lantern
              <Tag>New</Tag>
              <PickerItemValue>12g</PickerItemValue>
              <PickerItemValue>0</PickerItemValue>
            </PickerItem>
            <PickerItem
              id="charm"
              note="Wards off one bad turn."
              onSelect={noop}
            >
              Lucky charm
              <PickerItemValue>8g</PickerItemValue>
              <PickerItemValue>12</PickerItemValue>
            </PickerItem>
            <PickerItem
              id="rope"
              disabled
              note="15g short. Sell something first: it is strong enough for a ferry."
              onSelect={noop}
            >
              Rope
              <PickerItemValue>45g</PickerItemValue>
              <PickerItemValue>1</PickerItemValue>
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
