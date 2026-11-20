---
status: doing # todo | doing | done
step: D+ # proposal from day-zero: accept, change or cut
depends: [day-zero]
pr:
---

# `number-readout`: A labelled number the player reads at a glance

**Problem.** Day zero: the gold in the shop was a one-row `Ledger` in a `Window` (3 of 6 runs:
`no-cli/shop-2/shop.tsx:81-83`, `cli/shop-3/shop.tsx:55-57`), a `Heading` (`no-cli/shop-3/shop.tsx:48`) or
a `Text` with a hand-added `aria-live` (`cli/shop-1/shop.tsx:45`). A member's HP and MP were bare
`span`s, `HP {m.hp}/{m.maxHp}`, in all 6 `fight-hud` runs (`no-cli/fight-hud-1/fight.tsx:109-114`,
`cli/fight-hud-2/fight.tsx:115-120`). `camp-rest` shows gold too and left the camp's own readout alone.
The catalog's "single number readout" touches 3 tasks and "may be a `Ledger` of one row".

**Outcome.** A component for one value with its label, optionally as current out of max, that says
itself to a screen reader when it changes (the polite live region agents add by hand). It is
`Ledger`'s sibling for one number, not a second table. Proposed name `Readout`; the user decides
whether this is instead a `variant` of `Ledger` (a bare row), which `building-components.mdx` prefers
if the behaviour is the same.

**Included.** Component, styles, page, stories, tests. `value` and optional `max` as numbers,
the label as children; a `changes` announcement through `useAnnounce` only when the value changes.

**Base UI.** With a `max`, built on `@base-ui/react/meter` (`Meter.Root`, `Meter.Label`, `Meter.Value`), so current out of max has the meter role and its values for a screen reader; a single value without `max` has no Base UI primitive and stays plain markup. Blip's own `Meter` (the boxes) is not on Base UI; say in the Notes whether it should be.

**Not included.** A bar (that is `Meter`). Formatting for time (see
[`time-readout`](time-readout.md)). Any harness piece.

**Acceptance criteria.**

- Gold, and "HP 42/50" with "MP 6/10", are written with it and nothing else around them
- The live region does not speak on first render, only on a change (test)
- Follows `building-components.mdx`; `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass;
  `pnpm vrt:blip-ui` run in Docker (asked first)
- A fresh-context review in the pull request

**Depends on.** [`day-zero`](day-zero.md).

**Changes in the eval.** Measure 5: the three ways to write gold and the `span` HP should become one
component; `Heading` for a value should disappear.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
