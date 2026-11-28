import { Pixels, usePixels } from '../../../providers/pixels';
import { Actions, Title } from '../../parts/parts';
import { Legend, Window } from '../../window/window';
import { Picker, PickerGroup, PickerItem, PickerSetting } from '../picker';

const noop = () => {};

/**
 * The usual place of a picker: a title, the list and the keys in a
 * window. The cursor's item has a note, in a window of its own beside it
 */
export function InAWindow() {
  const pixels = usePixels();
  // Upright the rows are a thumb's height and the note goes under the
  // window: more rows, the full width. Text has a floor, so at 1x the
  // stage needs more room (in em) than its stage pixels give: the
  // window's title sits a whole stage pixel (3px at the floor) above its
  // list, so it is taller than its stage pixels say
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground)"
      style={{
        width: 'max(calc(var(--px) * 320), 34em)',
        height: `max(calc(var(--px) * ${pixels.tall ? 300 : 110}), 14.5em)`,
      }}
    >
      <div className="absolute top-[calc(var(--px)*6)] left-[calc(var(--px)*30)] tall:inset-x-[calc(var(--px)*6)]">
        <Window>
          <Title>Options</Title>
          <Actions>
            <Picker>
              <PickerSetting
                id="mode"
                value="Easy"
                note="A ghost helps you and nothing rushes you."
                onStep={noop}
              >
                Mode
              </PickerSetting>
              <PickerItem
                id="music"
                note="M mutes everything, anywhere."
                onSelect={noop}
              >
                Music
              </PickerItem>
              <PickerGroup>
                <PickerItem
                  id="erase"
                  disabled
                  note="Nothing saved yet."
                  onSelect={noop}
                >
                  Erase save
                </PickerItem>
              </PickerGroup>
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
      </div>
    </Pixels>
  );
}
