---
status: doing # todo | doing | done
step: D+ # proposal from day-zero: accept, change or cut
depends: [day-zero]
pr: https://github.com/sebald/sebald.me/pull/214
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

- **Built:** `Readout` (`value`, optional `max`, `silent`, label as children), with page, rules sidecar (`C-READOUT-1..5`, all `[review]`), example `readout/party-status`, stories `Default`, `Overview`, `PartyStatus`, tests (`readout.test.ts`).
- **Own component, not a `Ledger` variant (for the user):** a `Ledger` row is a term and value in a table of rows; `Readout` stands alone and has behaviour of its own (a change announcement through `useAnnounce`, the meter role with a `max`). `building-components.mdx` asks for a new component for new behaviour; the behaviour is not the same. Name `Readout` kept; the user may still rename it.
- **`changes` announcement:** said on a change only, never on first render, nor when the value is set to what it was; `silent` (a boolean for the state) turns it off for a number that moves often. Text is `HP 34 of 50` / `Gold 150`.
- **Base UI:** with a `max`, `Meter.Root`/`Label`/`Value` (role `meter`, `aria-valuetext` `42 of 50`); without one, plain markup. Numbers are formatted `en-US` so server and client agree.
- **Should Blip's own `Meter` (the boxes) move to Base UI? (for the user):** not needed for now. It is a `span` with `role="meter"` and the same aria attributes, and the cells are drawn by the kit; moving it would only swap the root and the attributes for `Meter.Root` and `Meter.Label` (which would give it the label wiring it now asks for through `aria-label`). Worth doing when `Meter` is next touched, not for this task.
- **Test gap:** the first-render criterion is tested through the pure `announcement()` and checked in Storybook (live region empty at load, `Gold 150` after a change); the repo has no DOM test setup to render the component with an announcer.
- **Shared test touched:** `cli/build/sidecar.test.ts` listed the known pages by hand; it now reads every `.mdx` basename in `src`, so a new component needs no edit there.
