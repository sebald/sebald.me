---
status: doing # todo | doing | done
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
`tsc`, the build, raw HTML tags and `className`s, imports from the package that are not
exports. The task's `rubric.json` says which lines count (`scope`, `evals/blip/README.md`):
`changed-lines` (`camp-rest`, `pause`) counts only lines changed since the run's first commit,
so the messy `camp.tsx` isn't held against the agent; `all` counts the whole of `src/`. Overrides that recur: restyling classes grouped by the Blip component
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
- In the fixtures, a raw `div` left untouched in `camp.tsx` is not counted for a
  `changed-lines` task, and one the agent added is
- Only `summary.md` and `results.json` are written inside the repo

**Depends on.** [`template`](template.md). Developed against the run layout of spec 3.3; needs [`eval-run`](eval-run.md) to
be tried on a real run.

**Changes in the eval.** The deterministic layer: measures 1, 5, 6 and 7 of spec 3.6.

## Notes

**Changed.** `evals/blip/collect.mjs` (entry and `collect()`/`write()`), `lib/transcript.mjs`
(stream-json counts, `blip` calls, network), `lib/tree.mjs` (parse with `oxc-parser`, scope by
`git diff` since the root commit, `tsc` and `vite build`), `lib/aggregate.mjs` (medians, Q11
candidates), `lib/summary.mjs`, `collect.test.mjs`, `fixtures/` (ten hand-made runs, each with
`expected.json` beside it, and `build-cache.mjs` that lays them out as a cache). `pnpm test` runs
`evals/blip/**/*.test.mjs`. `oxc-parser` 0.127.0 is a root devDependency (TypeScript 7 has no JS
API); `evals/blip/fixtures` is excluded from lint, format and `tsc` like the template. README:
"Collecting".

**Decisions** (the spec leaves the layout open, `eval-run` must match):

- Run dir is the agent's project (`src/`, `node_modules/`, `.git` with the template as root
  commit); `transcript.jsonl` inside it, or `<run>.transcript.jsonl` beside it. The config and
  task come from the path (`<task>-<n>`, the number after the last hyphen)
- Blip identity: package.json version plus a hash of `dist` and `docs`, since the version is
  `0.0.0` always; no `pack.json` is read. If `run.mjs` records a tarball hash, `cli.version` could
  take it instead
- Changed lines are taken against the root commit including uncommitted and untracked files; the
  recurring-override check always uses changed lines, even in `all` tasks (otherwise the untouched
  `camp.tsx` would be a "candidate" in every run)
- The collector never calls the `blip` CLI yet (no `validate`), so `BLIP_EVENTS=off` is in the
  env of every process it starts (`tsc`, `vite`, `git`) and is tested as such; `.blip/` is neither
  read nor written. `tsc` and `vite build` do write `dist/` into the run dir
- `results.json` has no dates or absolute paths; the date is only in the folder name
- Measures here: 1, 5, 6, 7 plus tsc errors and network/over-budget lists; shares for yes/no,
  median with min to max otherwise; "vs previous" is the difference of the configuration's median
  or share to the one before it in spec order
- A run with no `result` event or a usage-limit end is `incomplete` and left out of medians

**Checked.** `pnpm lint`, `pnpm format:check`, `pnpm test` pass (22 collector tests among them);
root `pnpm typecheck` shows the same 34 environmental errors as `origin/blip-harness`, none under
`evals/`. Two collects of the fixtures give identical files and leave the agent's
`.blip/events.jsonl` byte for byte. Not tried against a real run, a real tarball or a real
transcript (`eval-run` is not merged): the stream-json shape is from Claude Code's documented
format, not a captured one.

**Review** (subagent, fresh context). Fixed: version identity (now hashed); network false
negatives (flags before a package, absolute paths, `timeout`/`env`/`xargs`, `bash -c`, `npx`,
`node -e`) and false positives (quotes, heredocs); `blip` calls with flags before the
subcommand; `git diff` prefixes and quoted paths pinned; invented imports `null` without a
manifest; `scope` validated; conditional tests out of `className`; label sanitised and results
schema checked; `GIT_OPTIONAL_LOCKS=0`. Left: a multi-line `className` is scoped by its first
line; `components.other` takes unresolvable names; whether `result.usage` already includes
subagents is unverified without a real transcript (`subagents.tokens` is reported apart, not
subtracted); `error_max_turns` counts as `failed` not `incomplete`; the build writes `dist/` (a
second collect sees it); determinism with `tsc` and `vite` running is only tested with stubs.
