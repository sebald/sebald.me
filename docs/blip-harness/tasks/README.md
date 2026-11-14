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

## Working on a task

- Start the session with the task's file (`@docs/blip-harness/tasks/<handle>.md`)
- Set `status: doing` when work starts, `done` when its pull request is merged into
  `blip-harness`, and `pr:` to the pull request
- Write what changed, decisions and numbers under **Notes** in the same file
- `grep -H '^status:' docs/blip-harness/tasks/*.md` lists where everything stands

`blip-harness` lives as a draft pull request against `main`, so CI runs on every push to it.
Pull requests into `blip-harness` get no CI of their own (the workflows only run for `main`):
run `pnpm lint`, `pnpm test` and `pnpm typecheck` before merging one, and read the draft
pull request's checks after.
