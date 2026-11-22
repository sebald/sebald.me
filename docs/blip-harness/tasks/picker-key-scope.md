---
status: doing # todo | doing | done
step: N1 # forms and navigation
depends: []
pr:
---

# `picker-key-scope`: A Picker takes keys only for the menu the player is in

**Problem.** When any `Picker` is on a page it takes Up and Down globally. In Storybook, a docs page with several stories can use only one of them, and a page with two menus or windows cannot use the others. In a game this means a second menu on a screen (a dialog on a menu, two windows) fights for the same keys.

**Outcome.** Picker and menu keys act only for the window or menu that is active: the one that has focus within it, or the one the player last interacted with. A game screen with a single menu still works with no click first. A docs page with several stories works, each story on its own.

**Included.** The scoping rule in the key layer (`key-layer.ts`) and `Picker`, a story or example page with two Pickers that proves it, the tests for focus-within, last-interacted and the single-menu default, and the rule in `picker.mdx`.

**Not included.** A change of what the keys do inside a Picker (that is `form-navigation` for forms). Gamepad input (Q18).

**Acceptance criteria.**

- With two Pickers on one page, Up and Down move only the one the player clicked or focused; clicking the other hands the keys over
- With one Picker and nothing clicked, Up, Down and Enter work at once (the game screens' case)
- A Dialog on top still mutes the menu below it, as today
- A focused text field still keeps its keys
- The docs page of a component with several stories can be used story by story; `pnpm test:game` plays on unchanged
- Follows `building-components.mdx`: named by what it does, `data-slot`, `className` merged last, colours from `--bui-*`, spacing from `SPACE`, motion only as the foundations allow, no `next/*`
- `blip docs <page>` shows its props table, its example and its rules; `blip search` finds it by what a player would call it
- `pnpm test`, `pnpm typecheck`, `pnpm test:game` pass; `pnpm vrt:blip-ui` run in Docker when a story's look changes (asked first, never started in CI)
- A changeset naming `@sebald/blip-ui`
- A fresh-context review against `AGENTS.md` and `building-components.mdx`, in the pull request

**Depends on.** Nothing. It is the first fix because every later task is tried in Storybook, where it bites.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

**Mechanism.** A key scope per key layer (`useKeyScope`, `joinKeyScope`, `holdsKeys` in `key-layer.ts`). Every active `Picker` joins the scope of its layer by its root element. The keys go to the one the player last pointed at (`pointerenter`), pressed on (`pointerdown`) or moved the focus into (`focusin`); until then to the first on the page, so a game screen with one menu needs no click. A picker that goes away or turns `active` off leaves, and the keys fall back to the first. Scopes are per layer, so a `Dialog` keeps its own and still mutes the menu below. Chosen over "focus within only" (a game screen has no focus until a click) and over a global "last used" (a Dialog's picker would lose to the screen's). Users write no key code.

**Game.** Unchanged: every Pushback screen has one active Picker per layer (the pause menu is in a Dialog). `pnpm test:game` passes.

**Checked in Storybook (own port, Playwright).** `Two menus`: Down with no click moves the first, a click on the second hands the keys over and back. Picker docs page (8 pickers): each active one is usable after a click. `Default` works with no click. `Dialog` Default: Down moves the dialog's menu only.

**Review (fresh subagent).** Fixed: hover now claims the keys (the cursor moves on hover); the page and rules say the list, not the Window, hands the keys over, that directional input alone cannot reach a second menu (follows the web; Q18), and C-PICKER-1/2 no longer contradict each other or C-DIALOG-5; changeset split. Not done: the menu without the keys still draws its cursor and note (needs the claim as state, a follow-up with `focus-style`); the `TwoMenus` story has baselines still to come (`pnpm vrt:blip-ui:update:ci`, to be asked first); a click on a portalled note does not claim; `useKeyScope` stays internal; `Tabs` with `keys` still listens globally.

Decided 2026-11-22, after the design review of `TextField` (#215) and the research in [`research/forms-and-navigation.md`](../research/forms-and-navigation.md).
