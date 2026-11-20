---
status: todo # todo | doing | done
step: D+ # common component: accept, change or cut
depends: [rule-format, manifest-props, examples-and-patterns]
pr:
---

# `switch`: Turn an option on or off

**Problem.** Every design system has a switch or checkbox. Blip covers on and off with `Setting`
(`Music ◀ On ▶`), which steps through values with left and right. That works, but an agent that
looks for "toggle", "switch" or "checkbox" finds nothing, and a two-value `Setting` that flips on
Enter is a different behaviour.

**Outcome.** First a decision, then the work: a `Setting` variant for two values that also flips on
Enter and on a tap, or its own component. `building-components.mdx` says a new component only for
new behaviour; write down which way and why. Either way `blip search toggle` lands on it.

**Included.** The component, its `*.styles.ts`, an MDX page with the guidelines, its rules
sidecar, an example file, stories (`Default`, `Overview`, compositions only where they show
something new), and the tests `foundations/uniformity.test.ts` runs. If it becomes a `Setting` variant, no new page: the `setting` page gains a section, its
example and its rules.

**Not included.** A checkbox list (a `Picker` with marks is `picker-item-parts`). Any eval task change.

**Acceptance criteria.**

- The decision and its reason are in the Notes and on the page
- It has the switch role and `aria-checked` (or the Setting's equivalent), and says its state in words, not by colour alone
- Left, right, Enter and a tap all change it, and a change plays the feedback sound through `useFeedback()`
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged
  last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by
  what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker, since the
  stories are new (asked first, never started in CI)
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`rule-format`](rule-format.md), [`manifest-props`](manifest-props.md),
[`examples-and-patterns`](examples-and-patterns.md).

**Changes in the eval.** `pause` asks for options; agents may now pick the switch for on and off.
Take a new baseline once it ships.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
