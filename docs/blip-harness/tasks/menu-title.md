---
status: todo # todo | doing | done
step: N2 # forms and navigation
depends: [picker-key-scope]
pr:
---

# `menu-title`: The window title names the menu

**Problem.** A `Picker` has no visible label (`label` is for screen readers only), and nothing says how a list is named. SNES lists got their name from the window's title, with no label of their own.

**Outcome.** A rule: a window is a menu (a `Picker`; the window's `Title` names the list; its keys are the Picker's) or a form (separate controls). No `Picker` in a form window; a list beside a form gets its own window or step. The docs say it, and `Picker` and `Window` make it easy to keep: the `Title` can name the `Picker` for a screen reader, so the visible name and the accessible name are one.

**Included.** The rule in `picker.mdx`, `window.mdx` and `building-components.mdx`, the sidecar rules (with `when-not`), the link from `Title` to `Picker`'s accessible name if a small change is enough, an example of a titled menu.

**Not included.** A visible label inside a Picker (decided against). Columns (`columns`). Back (`back-action`).

**Acceptance criteria.**

- `picker.mdx` and `window.mdx` state the menu-or-form rule, with a rule an agent can be checked against (`validate`)
- A menu window's title names its `Picker` for a screen reader without a second prop to keep in sync
- The example is a titled menu that follows the rule
- Written in `building-components.mdx` or the page named above, in the voice of the existing rules, with a rule in the sidecar where a machine can check it
- `pnpm test`, `pnpm format:check`, `pnpm lint` pass; a changeset (empty if only prose outside `src/` changes)
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`picker-key-scope`](picker-key-scope.md), so that a titled window's keys stay its own.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
