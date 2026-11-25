---
status: doing # todo | doing | done
step: N3 # forms and navigation
depends: [field, focus-style]
pr: 238
---

# `stepper`: The one choice control in a form (replaces Switch)

**Problem.** A form has nothing to choose a value with: `Setting` is display-only and `Switch` covers only two values and a second look for the same choice (On and Off). Two controls for one idea mean an agent has to choose, and `setting.mdx` and `switch.mdx` disagree on where On and Off belong. Decided 2026-11-22: `Switch` is dropped.

**Outcome.** A standalone, focusable stepper, `Stepper`, shown as `Music ◀ On ▶`, is the one choice control in a form (On and Off, Normal and Hard, Slow and Fast). Two values: `role="switch"` with `aria-checked`, a flip on Left, Right, Enter, Space or a tap. More values: a slider that takes Left and Right only (Up and Down leave the row), and steps and wraps. The whole row is the tap target; a tap steps right. A form `name`. The move sound through `useFeedback()`. It sits inside `Field`. `PickerSetting` stays for menus.

**Included.** `Stepper` (styles, MDX page, sidecar, example, stories), its tests, the sound and announcement, the `row` or slider entry for it in the key layer's `focusTakes`. And the removal of `Switch`: the component, its page, stories, sidecar, rules (`C-SWITCH-1`, `C-SWITCH-2`), baselines, the export from `index.ts`, the mentions in `button.mdx`, `parts.mdx`, `text-field.mdx`, `text-field.styles.ts`, `options-rows.tsx` and `building-components.mdx`, with a changeset that says it is removed. Checked: Pushback does not import the component (its `soundSwitch` in `options.tsx` is a local helper), and no example or pattern uses it.

**Not included.** A thumb or a lit-track look; if the user wants one later it is a `variant`, not a second component. Keys between rows (`form-navigation`). Gamepad.

**Acceptance criteria.**

- Two values: a switch to a screen reader (`aria-checked`, a stable name); Left, Right, Enter, Space and a tap flip it; a 44 px row on touch
- Many values: a slider that moves on Left and Right only, wraps, and lets Up and Down leave; its value is announced
- Shown inside `Field` so its label aligns with the other controls; it is a Tab stop with the look from `focus-style`
- A form `name` submits its current value; it plays the move sound and announces the change
- `Switch` is gone from the code, the docs, the stories, the sidecars, the baselines and the exports; a grep for `Switch` outside this task's notes finds only unrelated words
- `setting.mdx` says the stepper is the form's choice and `PickerSetting` the menu's, with no On and Off exception
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing by role (`foundations/spacing.mdx`), motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`field`](field.md), [`focus-style`](focus-style.md). Replaces [`switch`](switch.md).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).

- `Stepper` is the row (`Field` + `FieldLabel` + `StepperControl`, `description`/`error` as `TextField` has); `StepperControl` the value between two `Step`s, for a `Field` composed by hand
- **Only `['Off', 'On']` is a switch** (user's choice, over "every two values"): Normal/Hard as a switch read "Difficulty, switch, off" and never said Normal. Every other set, two values included, is a horizontal slider with `aria-valuetext`, so it says its value. Matched by the words, so another spelling or language reads as a slider (it still works; a screen reader hears the word, not on/off)
- Two values flip on Left, Right, Enter, Space and a tap; more step and wrap, Home and End to the ends. A tap on the label steps it too (the label is tied by `aria-labelledby`, not `for`: a `div` is not labelable), so the whole row is the target
- The change is said by the role's own state (`aria-checked`, `aria-valuetext`), not the live region, which would say it twice
- Arrows dim at rest and primary with the focus, the field underline's colours (3.44:1 change); muted would have been 1.82:1. Listed in `uniformity.test.ts`'s focus table
- On the value's baseline: built from `Step`s and the value, not `Setting`, whose empty first arrow set the row's baseline 2 px high
- Label and description wired through Base UI's exported internals (`labelable-provider`, `field-root-context`)
- `focusTakes`: Enter and Space on a focused stepper are its own
- Also fixed: the pack build (`prepack`) failed since #235 on `process` in Form's and TextField's dev errors; `utils/dev.ts` declares what it reads
- Review (PR comment): logic moved to `stepper.keys.ts` with unit tests; `focusTakes` tested for a focused stepper; Home and End on every stepper; the label tap heard on the field (a label rendered later counts); a dev error for a value not in `values`; `.blip/events.jsonl` untracked and ignored
- The Base UI internals (`@base-ui/react/internals/*`) are not covered by its semver: `tests/visual/stepper.spec.ts` checks the name, description, keys and form value the browser computes, in the Blip visual workflow, which a Renovate bump of Base UI runs
