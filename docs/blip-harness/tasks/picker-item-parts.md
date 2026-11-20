---
status: todo # todo | doing | done
step: D+ # proposal from day-zero: accept, change or cut
depends: [day-zero]
pr:
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

Filled in while the task is worked on: what changed, decisions, numbers.
