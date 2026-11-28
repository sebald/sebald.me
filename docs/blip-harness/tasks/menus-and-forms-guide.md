---
status: done # todo | doing | done
step: N4 # forms and navigation
depends: [form-navigation, menu-title, stepper, field]
pr: 266
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

**Where.** `src/guides/menus-and-forms/` (the page, its sidecar, `examples/menu-and-form.tsx`, a story
under "Guides/Menus and forms"), a folder so the example has its page by name. The build lists it as
a foundation (`FOUNDATIONS` in `cli/build/index.ts`). `blip` with no arguments now starts with
"Building a screen? Start with blip docs menus-and-forms".

**What it says.** A menu and a form side by side in a table (what each is for, its parts, its name,
its choice control, its Back). Which control for which job, with "there is no switch". The keys as one
table per control, from `form.mdx`, `picker.mdx`, `stepper.mdx` and `text-field.mdx`: no new
behaviour. Screens in steps, the four patterns by their names. The game guidelines from
`building-components.mdx`, worded for a game's screens.

**Rules, no duplicates.** The decisions with a rule already (C-WINDOW-1, C-FORM-1, C-FORM-3, C-FIELD-1,
C-STEPPER-1/2, C-BUTTON-1/2, C-PICKER-4/5, C-FORM-4) are cited inline (`<Rule id>`), so each decision
keeps one ID. The sidecar adds the ones no page had: no own arrow keys, Tab left alone, keyboard keys
in a Legend (no controller hints, Q18), a list beside a form in its own window or step, search as its
own step, every screen playable by keys alone and by touch alone.

**Checks.** `no-own-arrow-keys` and `tab-untouched` are named, with a fix, and warn "no check yet",
as every named check does: the runner is [`validate`](validate.md) (step G), which writes a check for
every name. The criterion "the checks that can be written are" waits for it; the names are listed in
its notes.

**Links.** From `introduction.mdx` and from the pages of Picker, Form, Field, TextField, Stepper,
Button, Readout and Window. A Storybook link to a page whose title is words (`guides-menus-and-forms`)
did not become `blip docs …`: `pageForSlug` matched only the slug's last word. It now matches the
longest page id that ends the slug, then the old way (a test each).

**Checked.** `blip docs menus-and-forms` prints it. `blip search` finds it first for "menu", "form",
"keys" and "settings". `blip rules` lists its six rules.
