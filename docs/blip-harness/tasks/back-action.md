---
status: doing # todo | doing | done
step: N3 # forms and navigation
depends: [menu-title]
pr: 250
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

2026-11-26:

- No kit change was needed for Esc: a screen already gives Escape its handler through `useKeys` (it plays `back`), a `Dialog` closes on it, and a `TextField` takes the first Esc to let go of itself. The rule says to give Escape the handler Back has
- Checked `src/` by hand: no Back `Button` beside a `Picker` and no Back `PickerItem` in a `Form`. The question windows (`Leave the duel?` with Stay and Leave buttons, in the Dialog and Parts docs) are neither a menu nor a form, and have no Back; left as they are
- `Button`'s page has a Back section and a `Back` story (`examples/back.tsx`): a menu window and a form window side by side, Esc wired to the same handler. `picker.mdx`, `form.mdx` and the menu-screen pattern point at it; the pattern's example now wires Esc and names it in its legend. There is no pause or settings pattern yet (the task named them); the pause lives in the duel pattern's game code, not the kit
- Rules: `C-PICKER-4` (check `menu-back-item`), `C-PICKER-5` (Esc, review), a new `button.blip-rules.yaml` with `C-BUTTON-1` (check `form-back-button`), `C-BUTTON-2` (Esc, review) and a `when-not` to `picker`. The checks wait for `validate`
- The Game workflow now runs on pull requests into `blip-harness` too, as the Blip UI visual workflow does: #249 broke the game's test helper, and only the baseline update's game run caught it
- `pnpm test:game` locally: timeouts only (the machine at load ~37); CI's Game run is the judge
- Review: the prose in `picker.mdx` and `form.mdx` now says why, not the rule again; `C-PICKER-4` no longer asks for a `PickerGroup` (short lists, the dialog's Options and the Picker's `Default`, have none, and need no room); the Back example's legends name Enter too
- Left as they are: the other menu examples (in-a-window, a-menu, shop, game-options, the mood board) have a Back but no `useKeys({ Escape })` or `Esc` in their legend (`C-PICKER-5`); the game's pause menu has an `id="back"` item without `variant="back"` (it opens a leave question)
