import { Actions, Title } from '../../parts/parts';
import {
  Picker,
  PickerGroup,
  PickerItem,
  PickerItemValue,
} from '../../picker/picker';
import { ScreenTitle } from '../../text/text';
import { Legend, Window } from '../../window/window';
import { Screen } from '../screen';

const noop = () => {};

/**
 * Two windows on one screen, `variant="split"`: the shop's wares and the
 * player's bag side by side on the wide stage, one above the other upright.
 * Each is a menu of its own, with its title, its legend, its Back and its
 * keys: the one last pointed at or tapped has them
 */
export function BuyAndSell() {
  return (
    <Screen variant="split">
      <ScreenTitle blurb="Gold: 120">Shop</ScreenTitle>
      <Window>
        <Title>Buy</Title>
        <Actions>
          <Picker>
            <PickerItem id="coffee" onSelect={noop}>
              Coffee
              <PickerItemValue>4g</PickerItemValue>
            </PickerItem>
            <PickerItem id="desk" onSelect={noop}>
              Standing desk
              <PickerItemValue>90g</PickerItemValue>
            </PickerItem>
            <PickerItem id="plant" onSelect={noop}>
              Office plant
              <PickerItemValue>15g</PickerItemValue>
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
          touch="Tap to buy"
        />
      </Window>
      <Window>
        <Title>Sell</Title>
        <Actions>
          <Picker>
            <PickerItem id="mug" onSelect={noop}>
              Old mug
              <PickerItemValue>2g</PickerItemValue>
            </PickerItem>
            <PickerItem id="stapler" onSelect={noop}>
              Red stapler
              <PickerItemValue>8g</PickerItemValue>
            </PickerItem>
            <PickerGroup>
              <PickerItem id="sell-back" variant="back" onSelect={noop}>
                Back
              </PickerItem>
            </PickerGroup>
          </Picker>
        </Actions>
        <Legend
          keys={[
            ['↑↓', 'choose'],
            ['Enter', 'sell'],
          ]}
          touch="Tap to sell"
        />
      </Window>
    </Screen>
  );
}
