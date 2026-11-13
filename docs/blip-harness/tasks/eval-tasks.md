---
status: todo # todo | doing | done
step: A
depends: []
pr:
---

# `eval-tasks`: Write the eval's tasks and their rubrics

**Problem.** Everything the eval measures depends on what agents are asked to build, and the
template's data has to fit those tickets. The tasks come first.

**Outcome.** Six tasks in `evals/blip/tasks/<id>/`: `shop`, `saves`, `pause`, `fight-hud`,
`quests`, `camp-rest` (spec 3.2), each a `task.md` written like a ticket and a `rubric.json`.

**Included.** The ticket text. 3 to 6 rubric statements per task, at least one marked
`unstated` (empty inventory, not enough gold, a full slot). The URLs to screenshot per task
(`?screen=…&state=…`). A list of what `src/game/data.ts` must hold for the six tickets.
`evals/blip/README.md` with the two file formats.

**Not included.** The template, any code, anything taken from Pushback.

**Acceptance criteria.**

- No ticket names a Blip component, a rule or the CLI
- Every rubric statement can be answered yes or no from the diff or from one named screenshot
- Every unstated requirement is reachable through a fixture named in the task's URLs
- `camp-rest` changes a screen that already exists and says so
- I have read all six and would accept them as tickets

**Depends on.** Nothing.

**Changes in the eval.** Defines the tasks and the rubric layer's statements.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
