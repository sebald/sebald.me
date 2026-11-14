---
status: todo # todo | doing | done
step: C
depends: [template]
pr:
---

# `eval-collect`: Turn a label's runs into `results.json` and `summary.md`

**Problem.** A run leaves a transcript and a tree. Nothing counts what happened.

**Outcome.** `evals/blip/collect.mjs`, layer 1 of spec 3.5 without `blip validate` (which does
not exist yet).

**Included.** From the transcript: tool calls, `blip` calls, reads of the package's `dist` and
`docs`, TypeScript errors met, turns, tokens, cost, time, denials, over-budget. From the tree:
`tsc`, the build, raw HTML tags and `className`s on changed lines, imports from the package
that are not exports. Overrides that recur: restyling classes grouped by the Blip component
they sit on, raw tags by tag and classes; a group in at least 3 runs across 2 tasks is listed
as a candidate variant, size or component (**Q11**). Network use: runs whose Bash commands reach
out (`curl`, `wget`, `gh`, `npm view`, installing a package) are flagged and reported apart
(**Q2**). Every CLI call the collector makes sets `BLIP_EVENTS=off`, so the agent's event log is
never touched. `results.json` records the collector's version (its commit) and the CLI version it
used; `summary.md` refuses to put two results side by side that differ in either, and says to
collect again. `results/<date>-<label>/results.json` and
`summary.md` with the measures of spec 3.6 that exist so far. The schema in
`evals/blip/README.md`.

**Not included.** Screenshots, axe, the judge, `validate` metrics.

**Acceptance criteria.**

- Running it twice gives the same files, and leaves every run's `.blip/events.jsonl` byte for
  byte as the agent left it
- A fixture transcript with a `curl` in a Bash command is flagged as using the network
- On a small hand-made transcript in `evals/blip/fixtures/`, every count matches the numbers
  written beside it
- `summary.md` shows each measure per configuration and per task, with the number of runs
- In the fixtures, the same colour classes on `Button` in three runs of two tasks are listed
  once as a candidate; the same classes in three runs of one task, or a margin on `Button`, are
  not
- Only `summary.md` and `results.json` are written inside the repo

**Depends on.** [`template`](template.md). Developed against the run layout of spec 3.3; needs [`eval-run`](eval-run.md) to
be tried on a real run.

**Changes in the eval.** The deterministic layer: measures 1, 5, 6 and 7 of spec 3.6.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
