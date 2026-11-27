---
status: doing # todo | doing | done
step: D+ # follow-up of picker-item-parts, accepted by the user (2026-11-27)
depends: [picker-item-parts]
pr:
---

# `tag`: The picker's mark as a Tag, for any container

**Problem.** [`picker-item-parts`](picker-item-parts.md) added `PickerItemMark`, a short word beside
an item's name (`New`, `Done`). Neither its look nor its meaning is the picker's: a tab with
something new in it says the same thing the same way. Named for the picker, it could not be used
anywhere else, and a second container would have grown its own.

**Outcome.** `Tag` (`variant: 'new' | 'done'`, a string child), its own component with
`data-slot="tag"`; `PickerItemMark` is gone (never released, so no alias). A container that holds
one places it by its slot, a `related` gap after the name: `PickerItem` and `Tab`. It carries the
hidden space that keeps it a word of its own for a screen reader.

**Included.** `Tag`, its page, stories (Default, Overview, In a tab) and rules; the picker's
examples, page, rule C-PICKER-6 and visual spec on it; the tab's label placing it.

**Not included.** A framed or pixel-art tag; more variants (`locked`, a count) until something
needs them; Detail and Value stay the picker's (`Readout` and `Ledger` show values elsewhere).
Pushback's roster "locked" aside stays its own (its row lays out an icon).

**Accepted by the user (2026-11-27):** "tag should also be available outside of a menu", after
three agents tested the parts and checked them for reuse.
