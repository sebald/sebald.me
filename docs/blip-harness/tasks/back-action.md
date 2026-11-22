---
status: todo # todo | doing | done
step: N3 # forms and navigation
depends: [menu-title]
pr:
---

# `back-action`: Back is one thing in a menu and another in a form, by one rule

**Problem.** Back is a `PickerItem` in a menu and a `Button` in a form, and nothing says which. Agents write both in the same window.

**Outcome.** One rule: in a menu (a `Picker` window), Back is a `PickerItem`, usually in a `PickerGroup` below the others; in a form window, Back is a `Button` in `Actions`, and Esc is Back in both. The docs show the two side by side.

**Included.** The rule in `picker.mdx`, `button.mdx` and the pause and settings patterns' text, the sidecar rules, examples that follow it.

**Not included.** A new component. Where the cursor goes after Back (the screen's own business).

**Acceptance criteria.**

- `picker.mdx` and `button.mdx` say where Back lives for each kind of window, and that Esc is Back in both
- No example or pattern puts a Back `Button` in a menu or a Back `PickerItem` in a form window (checked by hand against `src/`; later by `validate`)
- Written in `building-components.mdx` or the page named above, in the voice of the existing rules, with a rule in the sidecar where a machine can check it
- `pnpm test`, `pnpm format:check`, `pnpm lint` pass; a changeset (empty if only prose outside `src/` changes)
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** [`menu-title`](menu-title.md) (it names the two kinds of window).

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
