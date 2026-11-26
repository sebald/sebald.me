---
status: doing # todo | doing | done
step: D+ # proposal from day-zero: accept, change or cut
depends: [day-zero]
pr: 255
---

# `picker-item-parts`: A list item with a second line, a trailing value and a mark

**Problem.** `PickerItem` takes text and a `note`. Day zero: all 6 `quests` runs built the item's body
by hand, name, "From <giver>" and "Next: <step>" as nested `span`s with their own `fontSize` or
`opacity` (`cli/quests-1/quests.tsx:55-63`, `no-cli/quests-2/quests.tsx:24-28`, a local `Row` in two);
all 6 `saves` runs did the same for a slot (`no-cli/saves-2/saves.tsx:45-57`,
`cli/saves-1/saves.tsx:45-56`); all 6 `shop` runs put the price in the item's text, `Tonic · 25g · too dear`
(`no-cli/shop-2/shop.tsx:37`, `cli/shop-3/shop.tsx:81`); all 6 `quests` runs wrote the done mark as text
(`cli/quests-1/quests.tsx:76`). This is the catalog's price slot, save slot summary, done mark and
objective reminder at once, and the one gap day zero found that the catalog's ranking does not name.

**Outcome.** `PickerItem`'s children can be parts, placed by `data-slot`: a title, a detail line, a
value at the end, and a mark (done, new). Per `building-components.mdx`, parts shared across
containers are named by role and the container tells them what they can't know through
`PartsContext`; check whether `Title` and `Content` already fit before adding names.

**Included.** The parts, `PickerItem`'s page and an example (one of the three tickets' shapes), a
story composition, tests; the keys and the note stay as they are.

**Base UI.** No new primitive: the parts sit inside Blip's own `Picker`, which is not on Base UI. Whether `Picker` should move to Base UI's `Menu` or `Select` is out of scope; note in the Notes what such a move would have to keep (the key layer, the cursor, the sounds).

**Not included.** A second kind of list. A table. Formatting a time or a date (see
[`time-readout`](time-readout.md)).

**Acceptance criteria.**

- A quest (name, giver, next step, done mark), a save slot and a shop item (name, price, shortfall)
  are each written with the parts and no `span` of their own
- A disabled item keeps its note and its parts dimmed together (`bui-disabled`)
- Follows `building-components.mdx`; `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass;
  `pnpm vrt:blip-ui` in Docker (asked first)
- A fresh-context review in the pull request

**Depends on.** [`day-zero`](day-zero.md).

**Changes in the eval.** Measure 5 (own components such as `Row`, `Slot`, `Label`, raw `span`s inside
a `PickerItem`) should fall in `quests`, `saves`, `shop`.

## Notes

**Parts.** Three, exported from the picker: `PickerItemDetail` (a line of its own under the name, 0.85em, muted; one per line, so a quest's giver and next step are two), `PickerItemValue` (at the row's end, where a `PickerSetting`'s value ends, tabular figures) and `PickerItemMark` (beside the name, 0.75em, `variant: 'new' | 'done'`: the second accent or muted, its words saying it, never the colour alone). The item's own text stays its name: no name part.

**`Title` and `Content` checked first, and they don't fit.** A `Title` is a heading (an `h2`) and wears the window's title id (`TitleIdContext`), so in a row it would put a heading inside a button and rename the menu; `Content` is a `div`. A row's parts are phrasing content of their own role, which no other container has, so they are the picker's, named after it as `PickerGroup` is.

**Placed by the item.** The label span becomes a wrapping flex row only when it holds a part (`has-[>[data-slot^=picker-item-]]`), so every existing item, plain text, renders as before (no baseline of an existing story should change). The detail goes last and full width whatever its place in the JSX, the value to the end. With a detail, the row aligns to the top and the cursor is centred on the name's line (`mt-[calc((1lh-var(--bui-px)*5)/2)]`, allowed in `uniformity.test.ts` as "on the text", like the speaker's mark and the ledger's dots).

**Disabled.** The parts sit inside the label that `bui-disabled` dims, so they dim with the name, nothing to add.

**A screen reader** reads the row's words in order, the parts as words of their own (`Rope 45g 15g short`, disabled), as the flex items are blocks; `tests/visual/picker-item-parts.spec.ts` pins it, with the dimming, the cursor's line and `escapes`/`cursorRoom` for the three examples at 3x, 1x and tall.

**Examples.** `quest-log`, `save-slots`, `shop-wares` in the picker's `examples/`, one story each: the three day-zero shapes written with the parts and no `span` of their own. Upright the note goes under the window, so each reserves room for it below (`tall:pb-[9em]`), as `InAWindow` does.

**Rule.** `C-PICKER-6` (review): a row's extras as parts, never styled `span`s or text run into the name.

**Base UI.** Not moved. A move of `Picker` to Base UI's `Menu` or `Select` would have to keep: the key layer (`useKeydown`, one menu on a layer has the keys, handed over by pointer and focus, Esc left to the screen), the one cursor (the keys' and the pointer's the same, `aria-current` not focus), the sounds on move, confirm, back and bump, a disabled item reachable and bumping, the note beside the row, the scrolling with no glide and the rail, and the name from the window's title.
