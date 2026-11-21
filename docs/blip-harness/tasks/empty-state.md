---
status: todo # todo | doing | done
step: after L # common component held back: gap drafts fire on this gap first
depends: [rule-format, manifest-props, examples-and-patterns]
pr:
---

# `empty-state`: Say why a list is empty and what fills it

**Problem.** Blip has no empty state. Day zero: 11 of 12 `shop` and `quests` runs wrote a line of
`Text` or `Heading` for an empty list, each in its own words and place. Most design systems have
an empty state.

**Held back on purpose.** `tasks/README.md` keeps "Empty list" open so gap drafts (step K) and the
sweep (step L) have it to fire on. Start this task after the sweep; until then it is a plan.

**Outcome.** What a window shows instead of a list with no rows: a line that says why it is empty,
an optional line on what fills it, an optional action. Proposed name `Empty`; the decision is the
user's, and so is whether it is a component or a `patterns` entry over `Text`.

**Included.** The component, its `*.styles.ts`, an MDX page with the guidelines, its rules
sidecar, an example file, stories (`Default`, `Overview`, compositions only where they show
something new), and the tests `foundations/uniformity.test.ts` runs. The candidate rules `P-EMPTY-101` ("Say why a list is empty and what fills it") and
`P-EMPTY-102` ("Show the empty line instead of a Picker with no rows, so the cursor is never on
nothing").

**Base UI.** No Base UI primitive fits; plain markup, its action a Blip `Button`.

**Not included.** Illustrations (Blip ships no art). Any eval task change.

**Acceptance criteria.**

- A `Picker` with no rows can show it in its place, and the cursor is never on nothing
- Its text is read when the list is reached, and an action in it takes focus as a row would
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged
  last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by
  what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker, since the
  stories are new (asked first, never started in CI)
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`rule-format`](rule-format.md), [`manifest-props`](manifest-props.md),
[`examples-and-patterns`](examples-and-patterns.md), and the sweep ([`sweep`](sweep.md)).

**Changes in the eval.** The `empty` fixture in `shop` and `quests` should show the same empty
line in every run. Take a new baseline once it ships.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
