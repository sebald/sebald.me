---
status: doing # todo | doing | done
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

2026-11-26:

- **The title names the menu.** `NamedByTitle` (parts) gives the window's body (`WindowFrame`, so a `Window`, a `Dialog` and a tab's panel) one id from `useId`. The `Title` wears it, a `Picker` without a `label` points at it (`aria-labelledby`). `Content` clears it, so a `Title` there is only a heading. No state and no effect, so the name is in the server's HTML too
- `Picker`'s `label` is optional and wins over the title (a shop titled `Gold: 120` keeps `label="Shop"`). A picker with neither is refused while building (console error, like a Picker in a Form); a scan of all 78 stories found none
- Dropped the labels a title already gave: the picker's in-a-window and two-menus examples (two-menus now uses `Title`/`Actions`, not a `Heading` and a margin), the dialog's options example, the mood board, Pushback's Options dialog. Kept where the title says something else (shop, pick-a-role, Confirm's Picker in its `Content`) or there is no title (the title screen, pause, result, roster, duel)
- Rules: `C-PICKER-3` (no label under a title, `check: picker-named-by-title`), `A-PICKER-1`, a `when-not` to `form`; a new `window.blip-rules.yaml` with `C-WINDOW-1` (menu or form, `check: window-menu-or-form`) and `C-WINDOW-2`. Both checks wait for `validate`
- Example: `Window`'s new `AMenu` story, a titled menu with its legend
- `tests/visual/picker-name.spec.ts`: the computed names in a window, two windows, a dialog, and the label fallback
- Found, not fixed: the pack step (`prepack`) stops on `compositions/examples/mood-board.tsx: there is no page "compositions"`, from before this task
