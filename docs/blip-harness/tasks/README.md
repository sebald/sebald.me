# Blip UI harness: tasks

26 tasks, one file each, in dependency order. Each is one pull request into `blip-harness`.
A task's file name is its handle. [`spec.md`](../spec.md) has the design each task builds;
**Q** numbers point into [`open-questions.md`](../open-questions.md).

**For every task that changes `packages/blip-ui`** (code, pages, stories, tests, build): before
it is merged, a subagent with fresh context reviews the pull request against `AGENTS.md` and
`building-components.mdx`, and its findings and their answers are in the pull request. This is
an acceptance criterion of each such task even where the task does not repeat it.

## Order

Tasks in one row can run in parallel. A row starts when the rows it depends on are merged.

| Step | Tasks                                                                                                                                                                                   | Needs                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| A    | [`eval-tasks`](eval-tasks.md), [`research-game-ui`](research-game-ui.md), [`research-web-ux`](research-web-ux.md), [`pack-build`](pack-build.md), [`readable-types`](readable-types.md) | nothing                                                  |
| B    | [`template`](template.md), [`cli-lookup`](cli-lookup.md)                                                                                                                                | A                                                        |
| C    | [`eval-run`](eval-run.md), [`eval-collect`](eval-collect.md)                                                                                                                            | B                                                        |
| D    | [`day-zero`](day-zero.md)                                                                                                                                                               | C                                                        |
| E    | [`eval-rendered`](eval-rendered.md), [`eval-judge`](eval-judge.md)                                                                                                                      | D                                                        |
| F    | [`rule-format`](rule-format.md), [`manifest-props`](manifest-props.md), [`examples-and-patterns`](examples-and-patterns.md)                                                             | [`cli-lookup`](cli-lookup.md)                            |
| G    | [`rule-extraction-menus`](rule-extraction-menus.md), [`rule-extraction-display`](rule-extraction-display.md), [`patterns`](patterns.md), [`validate`](validate.md)                      | F; [`patterns`](patterns.md) also D                      |
| H    | [`validate-compiler`](validate-compiler.md), [`plan-skill`](plan-skill.md)                                                                                                              | G                                                        |
| I    | [`edit-hook`](edit-hook.md)                                                                                                                                                             | [`validate`](validate.md), [`plan-skill`](plan-skill.md) |
| J    | [`reviewer`](reviewer.md)                                                                                                                                                               | [`validate-compiler`](validate-compiler.md), I           |
| K    | [`gap-drafts`](gap-drafts.md)                                                                                                                                                           | J                                                        |
| L    | [`sweep`](sweep.md)                                                                                                                                                                     | D, E, K, [`patterns`](patterns.md)                       |
| M    | [`reviewer-rendered`](reviewer-rendered.md) (right after v1)                                                                                                                            | L                                                        |

Steps A to D get the day-zero run going with the deterministic layer only. Its run directories
stay in the cache, and every later layer is added by collecting day zero again, without
rerunning an agent: the rendered layer and the judge in step E, [`validate`](validate.md)'s measure 2 in step G.
Results are compared only when the same collector and CLI version produced them ([`eval-collect`](eval-collect.md)).
[`readable-types`](readable-types.md) changes Blip itself and lands before day zero, so the baseline already has
readable types. Step F touches only Blip and the CLI, so it can be worked on while C to E run,
but nothing from F to K is packed into a tarball that day zero uses.
The components day zero calls for are drafted by [`day-zero`](day-zero.md) and are not in this list.

## Proposed by day zero

Day zero ran on Blip as of `57344be` (steps A and B). Four component tasks are **proposals** for the
user to accept, change or cut; each has `step: D+` and no place in the table above yet:

| Task                                        | Gap it closes (catalog)                                                    | Day zero's evidence                                              |
| ------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`screen-layout`](screen-layout.md)         | Screen layout (5 tasks)                                                    | hand-built in 21 of 24 screens                                   |
| [`number-readout`](number-readout.md)       | Single number readout (3)                                                  | gold in 3 shapes, HP/MP as `span`s in 6 of 6                     |
| [`picker-item-parts`](picker-item-parts.md) | Price slot, save slot summary, done mark, objective reminder (1 task each) | a two-line item built by hand in 6 of 6 `quests`, 6 of 6 `saves` |
| [`time-readout`](time-readout.md)           | Time and date readout (1)                                                  | two formatters in 6 of 6 `saves`                                 |

Follow-up: [`window-scroll`](window-scroll.md), a long list in a window scrolls instead of being cut off
(found by `screen-layout`; before a game screen relies on `Screen`).

## Common components

Components almost every design system has and Blip lacks, drafted so the kit is closer to a real
one and an agent has more to choose from. Also **proposals**; none of the six eval tasks needs them,
so a new baseline is taken on the tarball that ships them:

| Task                              | What it adds                                       | Step                                 |
| --------------------------------- | -------------------------------------------------- | ------------------------------------ |
| [`text-field`](text-field.md)     | A one-line text input (naming a hero or a save)    | D+                                   |
| [`switch`](switch.md)             | On and off; first decides `Setting` variant or not | D+                                   |
| [`portrait`](portrait.md)         | A framed face for dialogue and the party           | D+                                   |
| [`divider`](divider.md)           | A rule between groups, with an optional label      | D+                                   |
| [`notification`](notification.md) | A message that comes and goes                      | after L: gap drafts fire on it first |
| [`empty-state`](empty-state.md)   | What a window shows instead of an empty list       | after L: gap drafts fire on it first |

Left out: a tooltip (Blip is touch-first), a spinner (a pixel game rarely waits on a network), a
layout primitive (folded into [`screen-layout`](screen-layout.md)).

### Gaps left open on purpose

Every catalog gap that at least one task touches is above or here. These stay open so gap drafts
have something to fire on, or because a pattern or what exists is enough:

- **Empty list** (2 tasks): drafted as [`empty-state`](empty-state.md), held until after the sweep. A pattern, not a component, for now. 11 of 12 runs wrote a line of `Text` or `Heading`; nobody built anything
- **Notification / Result of a transaction** (2): drafted as [`notification`](notification.md), held until after the sweep. `useAnnounce` and the screen's own line cover it; the
  shop's result is only announced to a screen reader, a candidate for a gap draft
- **Bar, Enemy condition** (1): `Meter` in four cells fit in 6 of 6 runs; the missing piece is the HP-to-words mapping
- **Party member card, Fallen member** (1): a `hud` pattern over `Window`, `Ledger`, `Meter` (the `patterns` task), not a component
- **Turn indicator, Status icons** (1): all 6 runs wrote a `▶` prefix with `aria-current` and the word "Fallen" or the status as text. Left open for gap drafts, which is what they are for
- **Objective reminder** (1): the "Next:" line is covered by `picker-item-parts`; no pattern on purpose (Q12)
- **Pause menu as a pattern** (1): 6 of 6 composed it correctly; the `patterns` task writes it down
- **Text entry** (1, only if asked): drafted as [`text-field`](text-field.md). **Grid of choices**, **Floating numbers**, **Saving indicator** (0 tasks): no run reached for them

## Forms and navigation

Decided 2026-11-22 after the design review of `TextField` (#215) and a research round on text
entry, labels, menus, switches and keyboard navigation in game UIs
([`research/forms-and-navigation.md`](../research/forms-and-navigation.md)). All are `todo`, each
one pull request into `blip-harness`, and none changes the eval's six tasks; take a new baseline
once they ship. Steps N1 to N5 follow the same rule as A to M: tasks in one row can run in
parallel, a row starts when the rows it needs are merged.

**Decisions.**

- A window is a **menu** (`Picker`: actions and navigation; the window's title names the list) or a **form** (separate controls). No `Picker` in a form window; a list beside a form gets its own window or step.
- `Switch` is dropped. The standalone stepper is the one choice control in forms, On and Off included. `PickerSetting` stays for menus.
- Form keys, for all form controls: Up and Down move between rows (wrap at the ends), Left and Right change the value (Space and Enter also flip a two-valued one), Enter submits or presses, Esc leaves a field or goes back. Tab is unchanged for browsers and screen readers. A many-valued stepper is a slider taking Left and Right only. Landing on the nearest button when moving down onto a button row is accepted for now.
- A `Field` component owns placement (label column on the wide stage, stacked on the tall), label, description, error and the characters-left count; its child renders the control. All form controls' labels go through it.
- Patterns are named for the pattern, not the screen: a form window, pick then edit, a filtered list, an options screen.
- The gaps found are closed, as the tasks below. Gamepad support is not now, and there are no controller key hints: [Q18](../open-questions.md#q18-gamepad-support).
- A form window is a `Form` component: the design system moves focus by Up and Down for its users, nobody hooks keys up.
- Search over a list is its own step (a form window), like naming in pick then edit.
- The decisions reach the agents that use Blip: every task here updates its control's page and rules sidecar, so `blip docs` and `blip rules` serve them, and [`menus-and-forms-guide`](menus-and-forms-guide.md) ships the overview. `building-components.mdx` is for building the kit and does not ship.

| Step | Tasks                                                                                                                                                                                                     | Needs                                                                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| N1   | [`picker-key-scope`](picker-key-scope.md), [`focus-style`](focus-style.md), [`content-rhythm`](content-rhythm.md), [`divider`](divider.md), [`window-scroll`](window-scroll.md)                           | nothing new (`divider` and `window-scroll` as before)                                                                                                                          |
| N2   | [`field`](field.md), [`menu-title`](menu-title.md), [`columns`](columns.md), [`window-layout`](window-layout.md), [`list-position`](list-position.md)                                                     | `field`: `content-rhythm`, `focus-style`; `menu-title`, `list-position`: `picker-key-scope`; `columns`: `picker-item-parts`; `window-layout`: `screen-layout`, `window-scroll` |
| N3   | [`stepper`](stepper.md), [`back-action`](back-action.md)                                                                                                                                                  | `stepper`: `field`, `focus-style`; `back-action`: `menu-title`                                                                                                                 |
| N4   | [`form-navigation`](form-navigation.md), then [`menus-and-forms-guide`](menus-and-forms-guide.md)                                                                                                         | `stepper`, `field`, `picker-key-scope`                                                                                                                                         |
| N5   | [`pattern-form-window`](pattern-form-window.md), then [`pattern-pick-then-edit`](pattern-pick-then-edit.md); [`pattern-filtered-list`](pattern-filtered-list.md); [`pattern-options`](pattern-options.md) | see each: the components it uses, and `patterns` (step G)                                                                                                                      |

| Task                                                  | One line                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`picker-key-scope`](picker-key-scope.md)             | A Picker takes keys only for the menu the player is in (the Storybook bug: any Picker took Up and Down globally) |
| [`focus-style`](focus-style.md)                       | One focus look per control, built on the gold, passing WCAG 2.4.7 and 1.4.11, noting 2.4.13                      |
| [`content-rhythm`](content-rhythm.md)                 | `Content` sets the row gap, so patterns write no grid (kept its own task, not folded into `field`)               |
| [`field`](field.md)                                   | Label, description, error and count for any control; `TextField` rebuilt on it; fixes the phone's ragged rows    |
| [`menu-title`](menu-title.md)                         | The menu-or-form rule; the window title names the menu                                                           |
| [`columns`](columns.md)                               | Column headers and columned rows for lists such as wares                                                         |
| [`window-layout`](window-layout.md)                   | Windows side by side on the wide stage, stacked on the tall                                                      |
| [`list-position`](list-position.md)                   | "2 of 5" for a list                                                                                              |
| [`stepper`](stepper.md)                               | The one choice control in a form; removes `Switch`                                                               |
| [`back-action`](back-action.md)                       | Back as a `PickerItem` in menus, a `Button` in forms: one rule                                                   |
| [`form-navigation`](form-navigation.md)               | A `Form` moves between its rows by Up and Down and changes values by Left and Right; Tab unchanged               |
| [`menus-and-forms-guide`](menus-and-forms-guide.md)   | A shipped page and rules, so `blip docs` and `blip rules` tell a game's agent about menus, forms and keys        |
| [`pattern-form-window`](pattern-form-window.md)       | Reference pattern: a form window                                                                                 |
| [`pattern-pick-then-edit`](pattern-pick-then-edit.md) | Reference pattern: pick an item in a menu, edit it in a form                                                     |
| [`pattern-filtered-list`](pattern-filtered-list.md)   | Reference pattern: a list with columns, a filter, a position and scrolling                                       |
| [`pattern-options`](pattern-options.md)               | Reference pattern: an options screen                                                                             |
| [`mood-board`](mood-board.md)                         | Every control on one sheet, captioned, in the visual tests: the kit kept one look                                |
| [`look-here`](look-here.md)                           | Yellow says "look here" alone; a paper primary button, a text secondary                                          |
| [`window-edge`](window-edge.md)                       | One left edge and one right edge in a window: ledger, readouts, steppers, menu settings                          |
| [`tab-light`](tab-light.md)                           | The open tab continues the window's light instead of a flat fill                                                 |
| [`stepper-cursor`](stepper-cursor.md)                 | A stepper shows its field's cursor, its arrows white; the arrows a gap from the value                            |
| [`field-ground`](field-ground.md)                     | A text field is a line to write on, no ground, a pixel taller                                                    |
| [`help-column`](help-column.md)                       | Every description and error in a form starts on one edge, the control column's                                   |
| [`min-width-reset`](min-width-reset.md)               | A `min-w-*` class wins over the site's reset: the reset in the base layer                                        |

The pattern tasks are meant to be good enough for an agent to copy: built only from components,
every control used as its docs say, looked at at 1x, 3x and on the phone, the keyboard model
tested, and reviewed by the user before they merge.

[`switch`](switch.md) is superseded (done, then removed by `stepper`); [`text-field`](text-field.md)
is reworked by `field`.

## Working on a task

- Start the session with the task's file (`@docs/blip-harness/tasks/<handle>.md`)
- Set `status: doing` when work starts, `done` when its pull request is merged into
  `blip-harness`, and `pr:` to the pull request
- Write what changed, decisions and numbers under **Notes** in the same file
- `grep -H '^status:' docs/blip-harness/tasks/*.md` lists where everything stands
- When a milestone lands, add an entry to [`journal.md`](../journal.md): what happened, decisions,
  surprises, numbers, links. It is the thread a blog post will follow

`blip-harness` lives as a draft pull request against `main`, so every workflow runs on each
push to it. A pull request into `blip-harness` runs only the test workflow (lint, format,
tests, narrations). The screenshot workflows, Blip UI's visual regression and the game's
flows, run only for `main`, and are never started without asking first. A task that changes
`packages/blip-ui` runs `pnpm typecheck` and `pnpm test:game` locally and, when it changes
what a story looks like, `pnpm vrt:blip-ui` in Docker, says so in its pull request, and reads
the draft pull request's checks after it is merged.
