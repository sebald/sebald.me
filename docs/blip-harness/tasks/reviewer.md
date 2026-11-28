---
status: todo # todo | doing | done
step: J
depends: [validate-compiler, edit-hook]
pr:
---

# `reviewer`: Review a UI turn at its end and report at most five items

**Problem.** The hook sees one file's changed lines and only what a parser can check. Component
choice, composition, content, accessibility in context, and type errors need a second look.

**Outcome.** `blip review`, `blip hook stop`, `plugin/agents/reviewer.md`, the `Stop` entry in
`hooks.json`. The `reviewer` configuration.

**Included.** The packet of `blip review` (spec 2.4). `blip hook stop`: holds a stop once when
`.tsx` files changed and no review ran since, never more than twice a turn, never with
`reviewer: false`. The agent's text: run the packet, judge the `[review]` rules, fix, run it
once more, return at most 5 items as fixed, needs a decision, gaps; a finding with two
attempts goes to "needs a decision" untouched. Event `review` with the items.

**Not included.** The rendered pass. Filing anything. A reviewer for non-UI turns.

**Acceptance criteria.**

- A turn that changed no `.tsx` file ends without a review
- A turn that did ends with a message holding the three groups and at most 5 items
- With `reviewer: false` the stop is never held
- A turn cannot be held more than twice (test with a hook input where `stop_hook_active` is
  set)
- The reviewer's tokens can be read from the transcript and are in `results.json`
- A planted `[review]` fault (a column of buttons for a list of choices) is named in a run

**Depends on.** [`validate-compiler`](validate-compiler.md), [`edit-hook`](edit-hook.md).

**Changes in the eval.** Configuration `reviewer`. Metrics: the reviewer's tokens and share of
the cost, items by group, "needs a decision" items, findings left after the turn.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
