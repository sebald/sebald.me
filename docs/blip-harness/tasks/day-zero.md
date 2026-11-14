---
status: todo # todo | doing | done
step: D
depends: [eval-run, eval-collect, research-game-ui, readable-types]
pr:
---

# `day-zero`: Run the eval on today's Blip and decide what to build

**Problem.** Without a baseline, no later number means anything, and which components Blip is
missing is a guess.

**Outcome.** `evals/blip/results/<date>-day-zero/` for `no-cli` and `cli`, six tasks, three
repetitions each, on one tarball of today's Blip, collected with the deterministic layer. The
run directories stay in `~/.cache/blip-eval/` until the sweep: `eval-rendered`, `eval-judge`
and `validate` collect day zero again from them. A section in `summary.md`, written after
reading the runs, on what agents invented: raw elements, components of their own, Blip
components used for the wrong thing. A task file in `docs/blip-harness/tasks/` for each
component to build, and a list in `tasks/README.md` of the gaps left open on purpose.

**Included.** A pilot of three runs first, to set the budget per run and the wall-clock limit
from what they cost (**Q13**). Reading every failed run and a sample of the passing ones. The
spread between repetitions per measure, which later comparisons are held against.

**Not included.** Building the components. Any harness piece. The rendered layer, the judge and
`validate`'s measure 2, which are added by collecting again.

**Acceptance criteria.**

- 36 runs collected; runs that hit the budget or the time limit are reported, not dropped
- Every invented element in the write-up is tied to a run and a line
- Each catalog "gap" the tasks touch either has a task file or is listed as left open
- The estimates in **Q13** are replaced by measured numbers

**Depends on.** [`eval-run`](eval-run.md), [`eval-collect`](eval-collect.md), [`research-game-ui`](research-game-ui.md) (the catalog), [`readable-types`](readable-types.md).

**Changes in the eval.** The baseline, first for measures 1, 5, 6 and 7, then for the rest as
the layers land, and the spread that defines "a piece helps".

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
