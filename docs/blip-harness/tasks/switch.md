---
status: done # todo | doing | done
step: D+ # common component: accept, change or cut
depends: [rule-format, manifest-props, examples-and-patterns]
pr: https://github.com/sebald/sebald.me/pull/216
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

**Base UI.** Built on `@base-ui/react/switch` (`Switch.Root`, `Switch.Thumb`), which gives the switch role, `aria-checked`, form value and keyboard. That settles the decision above toward its own component on Base UI; a `Setting` variant only if it can wrap the same primitive. Say which in the Notes.

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

- **Decision: its own component, `Switch`, on `@base-ui/react/switch`.** A `Setting` variant could
  not wrap the same primitive: `Setting` is a presentational span with no focus, no role and no
  keys (`PickerSetting` supplies them in a Picker), while a switch is a focusable control with the
  `switch` role, `aria-checked`, Enter/Space/tap and a form value, which is new behaviour in the
  sense of `building-components.mdx`. A two-value menu row stays a `PickerSetting`; the page and
  the rules (`C-SWITCH-1`, `C-SWITCH-2`, `when-not: setting, picker`) say so.
- API: `checked` / `defaultChecked` / `onCheckedChange(checked)`, `disabled`, `name`, `children`
  (the name), `className`. No `variant` or `size`: one look until a screen needs another.
- Left and Right both flip it (as they step a two-value `Setting`, which goes round), through an
  `onKeyDown` on the root. `focusTakes` in `key-layer.ts` now lists `switch` as a row widget, so a
  screen's `useKeys` or a Picker does not also hear the arrows while a Switch has the focus.
- A change plays `move` (a value stepped), checked with a provider in a throwaway story: tap,
  Left, Enter and Space each played it once.
- The state in words (`On`/`Off`) is drawn from the root's `data-checked` with CSS, so it follows a
  controlled or uncontrolled switch; it is `aria-hidden`, `aria-checked` says it to assistive tech.
- `cli/build/sidecar.test.ts` took a hard-coded page list; it now reads the `.mdx` pages, so a new
  component's sidecar needs no edit there (parallel component PRs would otherwise collide).
- `blip search toggle`: `switch` is second, after `icon-button` (its text says toggle more often);
  `checkbox` and `on off switch` land on it first.
- `pnpm test:game` needs port 3000 free; it was taken, so it ran with `GAME_PORT=3107`.
- Needs baselines (not taken, the user decides): `components-switch--default`,
  `components-switch--overview`, `components-switch--music`.
