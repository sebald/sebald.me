import { Pixels, usePixels } from '../../../providers/pixels';
import { Heading } from '../../text/text';
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
  // stage needs more room (in em) than its stage pixels give
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground)"
      style={{
        width: 'max(calc(var(--px) * 320), 34em)',
        height: `max(calc(var(--px) * ${pixels.tall ? 300 : 110}), 14em)`,
      }}
    >
      <div className="absolute top-[calc(var(--px)*6)] left-[calc(var(--px)*30)] tall:inset-x-[calc(var(--px)*6)]">
        <Window className="w-[19em] tall:w-full">
          <Heading>Options</Heading>
          <Picker label="Options" className="mt-[calc(var(--px)*3)]">
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
