import { Button } from '../../../components/button/button';
import { Actions, Content, Title } from '../../../components/parts/parts';
import {
  Picker,
  PickerGroup,
  PickerItem,
  PickerSetting,
} from '../../../components/picker/picker';
import { ScreenTitle, Text } from '../../../components/text/text';
import { Legend, Window } from '../../../components/window/window';

const noop = () => {};

/**
 * A menu screen: the title along the top, a window with a title, what
 * it says and a picker with a setting and a disabled item, its legend,
 * and the buttons under it. Put it on a `Stage`
 */
export function PickARole() {
  return (
    <>
      <ScreenTitle blurb="Whose side are you on today?">
        Pick a role
      </ScreenTitle>
      <div className="absolute inset-x-[calc(var(--px)*80)] top-[calc(var(--px)*44)] grid gap-[calc(var(--px)*6)] tall:inset-x-[calc(var(--px)*12)] tall:top-[calc(var(--px)*70)]">
        <Window>
          <Title>Developer</Title>
          <Content>
            <Text>Ships on Friday. Regrets nothing.</Text>
          </Content>
          <Actions>
            <Picker label="Menu" active={false}>
              <PickerItem id="start" variant="accent" onSelect={noop}>
                Start the run
              </PickerItem>
              <PickerSetting id="music" value="On" onStep={noop}>
                Music
              </PickerSetting>
              <PickerItem
                id="hard"
                disabled
                note="Beat the Stakeholder first."
                onSelect={noop}
              >
                Hard mode
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
        <div className="flex justify-center gap-[calc(var(--px)*4)]">
          <Button variant="secondary" size="small">
            Cancel
          </Button>
          <Button size="small">Play</Button>
        </div>
      </div>
    </>
  );
}
