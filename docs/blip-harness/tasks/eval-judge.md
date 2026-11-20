---
status: doing # todo | doing | done
step: E
depends: [eval-collect, eval-rendered, day-zero]
pr: https://github.com/sebald/sebald.me/pull/219
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

**Changed.** `evals/blip/judge.md` (the prompt), `lib/judge.mjs` (question per statement, schema check
with one retry, headless isolated call, cache in `<label>/.judge/`), `lib/labels.mjs` and `labels.mjs`
(hand labels), a hook in `collect.mjs` (`--judge`, `--judge-model`, `--judge-parallel`,
`--judge-max-usd`; `findRuns` exported), measure 3 in `lib/aggregate.mjs`, a "Rubric (the judge)"
section in `lib/summary.mjs`, `judge.test.mjs` (stand-in judge, no real call). README: "Judging".

**Decisions.** Model `claude-opus-5-5` (Q14). A diff question gets no tools, a screenshot question
`Read` only, its own short system prompt, started like `run.mjs` (env allowlist, `apiKeySource` must
be `none`, a wrong one aborts the whole judging). Judge errors and skipped statements are not in
measure 3's denominator. The config's own name is not redacted from code (`full`, `plan` are words); a
ticket, claim or note that names `.blip`, `CLAUDE.md` or `no-cli` is refused.

**Cost (measured, day zero, Claude Code 2.1.329).** $0.028 a question (diff, $0.027 to $0.034;
screenshot, one probe, $0.030), about $0.056 a run on the 12 questions of a run with 2 diff
statements. The 72 diff statements of day zero cost $2.02 of estimate. All 198 statements: about $5.6.

**Not done.** Screenshots (`eval-rendered` not merged): 126 screenshot statements are `skipped` and
left out of the shares; `screenshotPath` assumes `<run>/screenshots/<name>.png` or `<run>/<name>.png`
and is tested on a fixture. The hand-label agreement (6 runs, 90%) waits for the user: `labels/<task>.json`.
Run again with `--judge` once the screenshots exist; the 72 answers are cached.
Left open from the review: the judge's `init` is checked for `apiKeySource` only, not for plugins and
skills as `run.mjs` does; measure 3 does not show coverage beside the share; the diff is cut at 80,000
characters as a whole, not per file.
