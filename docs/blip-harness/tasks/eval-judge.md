---
status: todo # todo | doing | done
step: E
depends: [eval-collect, eval-rendered, day-zero]
pr:
---

# `eval-judge`: Score each run against its rubric with an LLM judge

**Problem.** Whether the shop shows what the player can't afford is not something a parser or
a layout check can answer.

**Outcome.** `collect.mjs` asks a judge each rubric statement and stores pass or fail with the
evidence.

**Included.** `evals/blip/judge.md`, the judge's prompt. One question per statement, from the
one source its `from` names (`evals/blip/README.md`): `diff` gets the ticket and the diff of
`src/`; `screenshot` gets the ticket and the one screenshot its `screenshot` names
(`<url id>@wide|phone`). A statement's `note` goes to the judge with it; its `url` is for the
human reader, not the judge. Nothing names the configuration. Results are keyed
`<task>/<id>`. JSON answers
checked against a schema; an invalid answer is retried once, then recorded as a judge error.
The judge's model and cost in `results.json` (**Q14**).

**Not included.** Judging style or taste. Comparing screenshots to each other.

**Acceptance criteria.**

- On six day-zero runs I labelled by hand, one per task, the judge agrees with me on at least
  nine statements in ten; where it does not, the statement is rewritten in `eval-tasks`
- Day zero is collected again from the cache, and its results now hold measure 3
- The judge's input contains no `.blip/`, no `CLAUDE.md` and no configuration name
- Unstated statements (`unstated: true`) are reported on their own
- A statement judged from a screenshot is given no diff, and one judged from the diff no
  screenshot
- `summary.md` lists every failed statement with the judge's evidence, for me to read

**Depends on.** [`eval-collect`](eval-collect.md), [`eval-rendered`](eval-rendered.md) (for the screenshots), [`day-zero`](day-zero.md) (the runs to
label and to collect again).

**Changes in the eval.** The rubric layer: measure 3.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
