import { Pixels, usePixels } from '../../../providers/pixels';
import { Window } from '../../window/window';
import { Picker, PickerItem } from '../picker';

const noop = () => {};

/**
 * More items than fit: the list scrolls with the cursor and a pixel rail
 * beside it shows where it is, an arrow lit at each end with more
 */
export function ScrollingList() {
  const pixels = usePixels();
  // Upright the window spans the stage and shows more rows
  return (
    <Pixels
      {...pixels}
      className="bg-(--bui-ground)"
      style={{
        width: `calc(var(--px) * ${pixels.tall ? 320 : 160})`,
        height: `calc(var(--px) * ${pixels.tall ? 172 : 110})`,
      }}
    >
      <Window className="absolute top-[calc(var(--px)*6)] left-[calc(var(--px)*30)] h-[calc(var(--px)*80)] w-[calc(var(--px)*100)] tall:inset-x-[calc(var(--px)*6)] tall:h-[calc(var(--px)*160)] tall:w-auto">
        <Picker label="Colleagues">
          {Array.from({ length: 12 }, (_, i) => (
            <PickerItem key={i} id={`item-${i}`} onSelect={noop}>
              Colleague {i + 1}
            </PickerItem>
          ))}
        </Picker>
      </Window>
    </Pixels>
  );
}
