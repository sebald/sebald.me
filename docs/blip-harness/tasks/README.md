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

### Gaps left open on purpose

Every catalog gap that at least one task touches is above or here. These stay open so gap drafts
have something to fire on, or because a pattern or what exists is enough:

- **Empty list** (2 tasks): a pattern, not a component. 11 of 12 runs wrote a line of `Text` or `Heading`; nobody built anything
- **Notification / Result of a transaction** (2): `useAnnounce` and the screen's own line cover it; the
  shop's result is only announced to a screen reader, a candidate for a gap draft
- **Bar, Enemy condition** (1): `Meter` in four cells fit in 6 of 6 runs; the missing piece is the HP-to-words mapping
- **Party member card, Fallen member** (1): a `hud` pattern over `Window`, `Ledger`, `Meter` (the `patterns` task), not a component
- **Turn indicator, Status icons** (1): all 6 runs wrote a `▶` prefix with `aria-current` and the word "Fallen" or the status as text. Left open for gap drafts, which is what they are for
- **Objective reminder** (1): the "Next:" line is covered by `picker-item-parts`; no pattern on purpose (Q12)
- **Pause menu as a pattern** (1): 6 of 6 composed it correctly; the `patterns` task writes it down
- **Text entry** (1, only if asked), **Grid of choices**, **Floating numbers**, **Saving indicator** (0 tasks): no run reached for them

## Working on a task

- Start the session with the task's file (`@docs/blip-harness/tasks/<handle>.md`)
- Set `status: doing` when work starts, `done` when its pull request is merged into
  `blip-harness`, and `pr:` to the pull request
- Write what changed, decisions and numbers under **Notes** in the same file
- `grep -H '^status:' docs/blip-harness/tasks/*.md` lists where everything stands

`blip-harness` lives as a draft pull request against `main`, so every workflow runs on each
push to it. A pull request into `blip-harness` runs only the test workflow (lint, format,
tests, narrations). The screenshot workflows, Blip UI's visual regression and the game's
flows, run only for `main`, and are never started without asking first. A task that changes
`packages/blip-ui` runs `pnpm typecheck` and `pnpm test:game` locally and, when it changes
what a story looks like, `pnpm vrt:blip-ui` in Docker, says so in its pull request, and reads
the draft pull request's checks after it is merged.
