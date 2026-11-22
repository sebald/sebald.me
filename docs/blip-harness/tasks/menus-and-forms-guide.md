---
status: todo # todo | doing | done
step: N4 # forms and navigation
depends: [form-navigation, menu-title, stepper, field]
pr:
---

# `menus-and-forms-guide`: The decisions reach the agents that use Blip

**Problem.** The forms-and-navigation decisions live in `docs/blip-harness/` and in `building-components.mdx`, and neither ships: the pack step leaves `building-components` out (`NOT_SHIPPED` in `cli/build/index.ts`) and the harness docs are not in the package. An agent building a game reads only what `blip docs`, `blip rules` and `blip examples` serve, so it would never hear that a window is a menu or a form, that a form window is a `Form`, or how the keys work.

**Outcome.** A shipped page, `src/menus-and-forms.mdx`, that a consumer's agent finds with `blip search menu`, `blip search form` and from `blip` itself: what a menu window is and what a form window is, which control for which job (`Picker`, `PickerSetting`, `Form`, `Field`, `TextField`, the stepper, `Button`, `Readout`), the keyboard model per control as a table, and the game guidelines to orient on (the same list as `building-components.mdx`, worded for a game's screens). Its rules sidecar turns each decision into a rule with a check where one can be written (no `Picker` inside a `Form`; a form window's controls inside a `Form`; one choice control per window for On and Off; every form control inside a `Field`).

**Included.** The page, its sidecar, a link from `introduction.mdx` and from each control's page, an example that is one menu window and one form window, the eval's `CLAUDE.md` line unchanged (the page is found through `blip`).

**Not included.** Building any of the components (their own tasks). A new eval task.

**Acceptance criteria.**

- `pnpm pack` ships the page: `blip docs menus-and-forms` prints it, `blip search` finds it by "menu", "form", "keys", "settings"
- `blip rules` lists its rules, each with a check or an `[review]` marker; the checks that can be written are
- Each decision in `docs/blip-harness/tasks/README.md` ("Forms and navigation") appears on the page or in a rule; nothing on the page contradicts a component's page
- `pnpm test` passes, a changeset, a fresh-context review in the pull request

**Depends on.** [`form-navigation`](form-navigation.md), [`menu-title`](menu-title.md), [`stepper`](stepper.md), [`field`](field.md).

## Notes

Filled in while the task is worked on.
