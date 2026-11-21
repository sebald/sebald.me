---
status: todo # todo | doing | done
step: L
depends: [day-zero, eval-rendered, eval-judge, gap-drafts, patterns]
pr:
---

# `sweep`: Run all six configurations on one Blip version and write up what each piece does

**Problem.** Each piece was tried as it landed, on different Blip versions. That says it runs,
not what it adds.

**Outcome.** `evals/blip/results/<date>-sweep/`: six configurations, six tasks, five
repetitions (**Q13**), one tarball, with the comparison of each configuration to the one
before it and my reading of the failed runs.

**Included.** The run. `summary.md` with the measures of spec 3.6 per step. The cost of each
gain. What did not help, said as plainly as what did.

**Not included.** Changes to the harness. The later experiments (docs from a URL, Storybook's
MCP).

**Acceptance criteria.**

- All configurations share one tarball hash, one model and one collector version
- Every claimed gain is larger than the spread between repetitions, or is called unclear
- A gain of `hook` or `reviewer` is claimed only on measure 3 or 4; their measure 2 is reported
  beside it as expected, since `validate` both steers and grades them
- Every failed run was read; the judge's agreement with me on a sample is stated
- The write-up names the piece with the best gain per dollar and the one with the worst
- Tasks with and without a matching pattern are reported apart

**Depends on.** [`day-zero`](day-zero.md), [`eval-rendered`](eval-rendered.md), [`eval-judge`](eval-judge.md), [`gap-drafts`](gap-drafts.md), [`patterns`](patterns.md).

**Changes in the eval.** The first full result. Input for the writing.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.
