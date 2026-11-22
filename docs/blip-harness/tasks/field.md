---
status: todo # todo | doing | done
step: N2 # forms and navigation
depends: [content-rhythm, focus-style]
pr:
---

# `field`: Label, description and error for any form control

**Problem.** Every control that needs a label places it its own way. `TextField` alone has a small muted label stacked above the input; `Switch`, `Readout` and `Content` rows use a label column; `Picker`, `Meter` and `Button` have none. On the tall stage the column variable (`--bui-label-width`) is unset, so rows stack with ragged edges. A new control would write its label again.

**Outcome.** A `Field` component that owns placement and the text around a control: the label (a label column on the wide stage through `Content`'s `--bui-label-width`, stacked above on the tall stage, so the phone's ragged rows are fixed here), the description, the error and, where relevant, the characters-left count. Its child renders the actual control (a text input, a stepper, whatever comes). All form controls' labels go through it, so they look and align alike.

**Included.** `Field` (on `@base-ui/react/field`, whose `Root`, `Label`, `Description` and `Error` already tie a label to its control), its styles, MDX page, sidecar, example, stories. `TextField` refactored onto it. Decided here: `TextField` becomes the input control inside `Field`, and its convenience stays only if the page can justify it. The ones to weigh: (a) `<TextField label=...>` as `Field` plus the input, kept because naming a hero is the commonest form and an agent looks for "text field"; (b) `Field` and `Input` only, with `TextField` removed and the rule saying so. Write the choice and the reason under Notes before building; recommended is (a), one line each in the docs, `TextField` a thin composition with no logic of its own. `Readout`'s label goes through `Field` too if it fits (a read-only value with a label); if it does not (it is not a control), say why in the page and leave it, so the column still lines up through `Content`.

**Not included.** The stepper (its own task). Keys between rows (`form-navigation`). Validation beyond what the control reports.

**Acceptance criteria.**

- The label sits in the label column on the wide stage and above the control on the tall one, at every scale, with no ragged rows on the phone (a story at 402 × 714 shows it)
- Description, error and the characters-left count are part of `Field`; the error is announced and its presence marks the control invalid
- The label is tied to the control it wraps for a screen reader, whatever that control is
- `TextField` is rebuilt on it with its tests, announcements and keys unchanged; `text-field.mdx`, its rules and its examples say what it is now
- The focus look comes from `focus-style`
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`content-rhythm`](content-rhythm.md) (the rows it sits in), [`focus-style`](focus-style.md). Supersedes the label parts of [`text-field`](text-field.md).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
