import { Actions, Title } from '../../parts/parts';
import { Tag } from '../../tag/tag';
import { Legend, Window } from '../../window/window';
import { Picker, PickerGroup, PickerItem, PickerItemDetail } from '../picker';

const noop = () => {};

/**
 * A quest log: each quest its name, who gave it and, while it is open,
 * what to do next, a line each; the done ones after, kept apart and
 * marked. Choosing one shows its whole description, a note
 */
export function QuestLog() {
  return (
    // Upright the note goes under the window: room for it below
    <div className="tall:pb-[9em]">
      <Window>
        <Title>Quests</Title>
        <Actions>
          <Picker>
            <PickerItem
              id="ferry"
              note="Maud's ferry rope snapped in the storm. Bring her a new one from the market."
              onSelect={noop}
            >
              The broken ferry
              <Tag>New</Tag>
              <PickerItemDetail>From Ferrywoman Maud</PickerItemDetail>
              <PickerItemDetail>Next: buy rope at the market</PickerItemDetail>
            </PickerItem>
            <PickerItem
              id="wolves"
              note="Wolves have been seen at Hollow Gate after dark. Drive them off before the caravan."
              onSelect={noop}
            >
              Wolves at the gate
              <PickerItemDetail>From Gatekeeper Tam</PickerItemDetail>
              <PickerItemDetail>
                Next: wait at the gate after dark
              </PickerItemDetail>
            </PickerItem>
            <PickerGroup>
              <PickerItem
                id="cat"
                note="Bess's cat was asleep in the mill. She thanks you with a pie."
                onSelect={noop}
              >
                The lost cat
                <Tag variant="done">Done</Tag>
                <PickerItemDetail>From Old Bess</PickerItemDetail>
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
            ['Esc', 'back'],
          ]}
          touch="Tap a quest to read it"
        />
      </Window>
    </div>
  );
}
