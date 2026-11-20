---
status: doing # todo | doing | done
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
- Each gap in the catalog's "Gaps, by how many tasks touch them"
  (`packages/blip-ui/research/catalog.md`, under "By task") with at least one task either has
  a task file or is listed as left open, and the write-up says where day zero's runs agree or
  disagree with that ranking
- The estimates in **Q13** are replaced by measured numbers

**Depends on.** [`eval-run`](eval-run.md), [`eval-collect`](eval-collect.md), [`research-game-ui`](research-game-ui.md) (the catalog), [`readable-types`](readable-types.md).

**Changes in the eval.** The baseline, first for measures 1, 5, 6 and 7, then for the rest as
the layers land, and the spread that defines "a piece helps".

## Notes

**Changed.** `evals/blip/results/2026-11-20-day-zero/` (`results.json`, `summary.md`, and
`invented.md`, the hand-written section that is also appended to `summary.md`: a re-collect
rewrites `summary.md` and `invented.md` is what to append again); four proposed task files
(`screen-layout`, `number-readout`, `picker-item-parts`, `time-readout`); `tasks/README.md` (the proposals and
the gaps left open on purpose); Q11 and Q13 in `open-questions.md`. One code change, in the collector:
`lib/transcript.mjs` writes the home directory as `~` in the network commands it records
(`results.json` held an absolute home path). No component, no change under `packages/blip-ui`.

**Which Blip.** The tarball is Blip as of commit `57344be` (`#198`, `cli-lookup`: steps A and B
only), packed from a detached worktree, sha256 `925ec59d8f14`, with `run.mjs` and `collect.mjs` from
`blip-harness`. A first set of runs on `blip-harness` HEAD (Blip with step F: `manifest-props`,
`rule-format`, examples) was stopped when this was noticed: 27 runs (17 `no-cli`, 10 `cli`) are kept in
`~/.cache/blip-eval/day-zero-with-f` as a first data point for step F (not collected, not committed;
their cost per run is $0.138 `no-cli`, $0.124 `cli`, the same within the spread). The pilot
(`day-zero-pilot`, 3 `cli` runs on HEAD) is only for the cost.

**Numbers.** 36 runs (6 tasks, 3 repetitions, 2 configurations): 36 done, 0 over budget, 0 timeout,
0 stopped by the usage limit; 2 `init`-check failures in 64 first attempts, redone and passed. $4.98 of
estimate, 26.7 minutes of wall clock for the 36, about $9 and 46 minutes for everything that ran.
`--budget 2`, `--timeout 10`. Both configurations built 18 of 18 with 0 `tsc` errors. Q13 holds the
per-config and per-task cost, turns and time. Collecting twice gives identical files (checked with
`cmp`, and again after the collector change).

**What the runs say** (details and `file:line` in `summary.md`, "What the agents invented"). Agents
compose Blip well where there is a part (pause: 6 of 6 identical and correct) and hand-build the same
few things elsewhere: the screen frame (21 of 24), a two-line list item (12 of 12), two time formatters
(6 of 6), the price in an item's text (6 of 6), the gold and HP as spans or a one-row `Ledger`. The
catalog's ranking holds at the top (screen layout, number readout) and is too low for the time readout
and the price slot. `no-cli` and `cli` are not told apart by layer 1: the difference (about $0.02 and one
turn a run) is inside the spread between repetitions; only the lookups differ (`blip` calls 0 against 9
a run, `docs` reads 2 against 0). `no-cli` writes Tailwind classes in 6 of 18 runs, `cli` none.

**Findings that are not about Blip.**

- The collector's candidate-override check (Q11) lists nothing, because it counts `className` and
  17 of the 21 layout frames are inline `style`. Not fixed here; `screen-layout` names it.
- `Stage.Center` is exported and on no page (`open-questions.md`, the list of undocumented exports),
  yet 3 `cli` runs used it, so agents find parts by the `.d.ts`.
- Claude Code sometimes loads a sixth built-in plugin, `cc-plugin-easel`, and the runner's `init`
  check then fails the run (2 of 64 attempts; the redo passed). The canary's baseline needs to
  allow it. Not changed here (`run.mjs` is `eval-run`'s).
- The runner's `run.mjs --label` ran `day-zero` in two invocations (`no-cli` then `cli`) as asked; stopping
  between runs needed a SIGINT right after a run ended, since the runner has no "finish and stop".
- `camp-rest` never touches Blip (6 of 6 matched the messy screen), so its `scope: changed-lines`
  measures read 0 for everything: only the rubric's statements will tell about it.

**Decisions for the user.** Accept, change or cut each of the four proposed tasks; whether
`Stage.Center` becomes the centred variant of `Screen`; whether `number-readout` is a component or a
`Ledger` variant.

**Review** (subagent, fresh context): see the pull request.
