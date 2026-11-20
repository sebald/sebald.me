---
status: doing # todo | doing | done
step: C
depends: [template, cli-lookup]
pr:
---

# `eval-run`: Run a task in an isolated copy of the template with headless Claude Code

**Problem.** A run inside this repo would read `AGENTS.md` and Blip's source, and would load
the user's own plugins and skills.

**Outcome.** `evals/blip/run.mjs` and `pnpm eval:blip`, as in spec 3.3, with the
configurations `no-cli` and `cli`.

**Included.** Packing or `--tarball`. One install per label, then an offline install per run.
The run directory outside the repo, `git init`, one commit. `CLAUDE.md` per configuration
(**Q10**). The command line (**Q2**, **Q7**), a wall-clock limit, one run at a time by default
(`--parallel n`). The subscription, not an API key (**Q13**): `ANTHROPIC_API_KEY` removed from
the child's environment, the usage-limit error recognised, the label stopped and resumable,
runs already in the cache skipped. `meta.json`
per run: configuration, task, repetition, model, tarball hash, Claude Code version, times,
exit. The check of the `init` event. A canary before each label that fails it if the global
memory file is visible. The other four configurations as named switches that stop with "not
built yet". `--dry` prints the commands and spends nothing.

**Not included.** Collecting or judging. The plugin.

**Acceptance criteria.**

- `--dry` prints one command per task and repetition
- One real run (`--tasks pause --reps 1 --config cli`) leaves `transcript.jsonl`, `meta.json`
  and the changed tree under `~/.cache/blip-eval/`
- No path in the run directory resolves into this repo
- `no-cli`: `node_modules/.bin/blip` is absent and `CLAUDE.md` does not mention the command
- The `init` event of a run lists no plugin, skill or agent from `~/.claude`
- A run over the wall-clock limit is ended and marked in `meta.json`
- With `ANTHROPIC_API_KEY` set in the calling shell, the `init` event still says
  `"apiKeySource":"none"`; a run that says anything else is failed
- Rerunning a label skips the runs already done; a run marked as stopped by the usage limit is
  redone from a fresh copy

**Depends on.** [`template`](template.md), [`cli-lookup`](cli-lookup.md).

**Changes in the eval.** Creates the runs. Configurations `no-cli` and `cli`.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

**Changed.** `evals/blip/run.mjs` (the runner), `run-lib.mjs` (its pure parts: command line,
environment, `CLAUDE.md`, init check, usage-limit test, skip rule) and `run-lib.test.mjs`
(`node --test evals/blip`, not in `pnpm test`), `pnpm eval:blip` in the root `package.json`, and
`evals/blip/README.md` ("Running a task"), which is the layout `eval-collect` reads: the cache
paths, the `meta.json` fields, what `transcript.jsonl` is, when a directory counts as a result.

**Decisions.**

- **The canary caught a real leak, and `--setting-sources project` is not enough on Claude Code
  2.1.329 (Q7).** The first real attempt stopped at the canary: asked in an empty folder, the
  child answered `LEAK:yes` and quoted the heading of `~/.claude/CLAUDE.md`. So Q7's finding (2.1.323)
  no longer holds. Fix, tried by hand before it went in: `claudeMdExcludes` in the project's
  `.claude/settings.json` listing `<home>/.claude/CLAUDE.md` and `<home>/.claude/rules/**`
  gives `LEAK:no`, on the subscription, with no `CLAUDE_CONFIG_DIR` and no token. The home
  path is written in at run time (the file is per run, never committed), and the canary uses the
  same file, so it tests what the runs get. This departs from spec 3.3's "settings.json:
  permissions only"; Q7 and the spec table need that line changed (not edited here, the task is
  the runner).
- Claude Code ignores `permissions.allow` from the run's `settings.json` ("this workspace has not
  been trusted", in `stderr.log`); `--allowedTools` does the approving, and the run's Bash,
  Edit and Write all worked. The file's permissions stay, harmless, as the spec says.
- Layout: `<cache>/<label>/<config>/<task>-<n>/` (n from 1), the run's `transcript.jsonl`,
  `meta.json` and `stderr.log` inside it but in `.git/info/exclude`, and written only after the
  child ends (streamed to `<label>/.tmp/` meanwhile) so the agent cannot read its own transcript.
  The directory is a git repo with one commit, `template`; the agent's change is the diff to it.
  `<label>/label.json` holds the tarball (sha256, version, commit) and the canary's baseline;
  one label is one tarball, a different `--tarball` is refused.
- `meta.status`: `done`, `timeout` (both results), `failed` (setup, init check, no result event),
  `stopped` (usage limit, `stoppedBy: "usage-limit"`, redone). No `meta.json` means unfinished,
  redone. `failed` is skipped on rerun unless `--retry-failed`.
- Init check: `apiKeySource` is `none`, and every plugin, skill and agent is one the canary's
  `init` listed (Claude Code's own: 5 built-in plugins, 19 skills, 6 agents on 2.1.329) or the
  configuration's, and none matches a name under `~/.claude` (skills, agents, installed
  plugins and their `plugin:skill` names). On a problem the child is killed at once.
- The child's environment drops `ANTHROPIC_API_KEY` and `ANTHROPIC_AUTH_TOKEN`, `npm_*`/`PNPM_*`
  variables and this repo's `node_modules/.bin` entries on `PATH` (`pnpm eval:blip` adds
  them, so `tsc` and `oxlint` of the repo would otherwise be on the agent's path). The prompt
  goes in on stdin: `--tools` and `--allowedTools` take lists and swallow a trailing positional.
- The canary's model is the alias `haiku` (the init event says `claude-sonnet-5` is served; the
  answer is the same either way). The wall-clock limit kills the child's process group
  (SIGTERM, SIGKILL after 10 s). Defaults: `--reps 1` (not day zero's 3, so a bare call is cheap),
  `--model claude-sonnet-5-5`, `--budget 4`, `--timeout 30` min.
- The usage-limit text is matched on its known wordings (`hit your limit`, `usage limit`,
  `limit reached`, a `rejected` rate-limit event); no real one was seen, so the exact form is
  still to confirm in the pilot (Q13). The stub run below proves the handling, not the wording.
- Only `run.mjs` is wired to `pnpm eval:blip`; spec 3.3 says "then `collect.mjs`", which `eval-collect`
  adds.

**Checked.**

- `--dry`: one `claude` command per task and repetition (4 for `--tasks pause,shop --reps 2`),
  nothing written; `--config plan` exits 2 with "not built yet".
- The one real run, `pnpm eval:blip --label pilot --config cli --tasks pause --reps 1`, started
  with `ANTHROPIC_API_KEY` set in the calling shell: **55 s, 9 turns, estimated $0.17**, status
  `done`. `init` said `"apiKeySource":"none"`, listed 5 built-in plugins, 19 skills, 6 agents and
  nothing from `~/.claude`; `transcript.jsonl` has 35 events. The agent added
  `src/screens/pause.tsx` and `paused-camp.tsx`, changed `camp.tsx` and `index.ts`, ran
  `pnpm typecheck` and `pnpm build`, and used `blip search` and `blip docs`. 127 symlinks in the run
  directory, none resolving into this repo; neither `package.json` nor the lockfile names its path.
- With a stand-in executable for `claude` (`BLIP_EVAL_CLAUDE`, behaviours scripted), a real
  pack, base install and offline per-run installs: `no-cli` has no `node_modules/.bin/blip` and
  its `CLAUDE.md` has no `pnpm exec blip`, `cli` has both; a hanging child with `--timeout 0.05`
  ended with SIGTERM and `status: "timeout"`, `timedOut: true`; a usage-limit result gave
  `status: "stopped"`, `stoppedBy: "usage-limit"`, no further run started, and the rerun redid it
  from a fresh copy (a marker file in the old copy was gone, `redoOf` set) and ran the next
  task; an `init` with another `apiKeySource` or an unexpected plugin gave `failed` and the
  reason; a `LEAK:yes` canary stopped the label before any run (exit 3); finished runs were
  skipped (`Every run ... is already done`).
- On the real run: the rerun skips it; with `stoppedBy` set to `usage-limit` in a copy of its
  `meta.json`, `--dry` lists it as `redo (usage limit)`.
- `node --test evals/blip` 9 pass; `pnpm lint`, `pnpm format:check`, `pnpm test` (386 pass)
  pass; root `pnpm typecheck` 34 errors, the same environmental ones as `origin/blip-harness`.

**Review** (subagent, fresh context, against the task, spec 3.3/3.4, Q2, Q7, Q10, Q13, README,
`AGENTS.md`). Fixed, each re-run with the stand-in `claude`:

- Blocking: Ctrl-C or SIGTERM left detached agents running. Now a registry of live process groups
  is killed on SIGINT, SIGTERM, SIGHUP, exit and uncaught errors (checked: a SIGINT to a hanging
  stand-in leaves no process). An error result (login, API, 5xx) was recorded `done`; now
  `failed` unless it is `error_max_budget_usd` or `error_max_turns`. The canary's `init` could
  taint the baseline; it is now checked for `~/.claude` origins, MCP servers and a wrong
  `apiKeySource`, and a later invocation with a different baseline is refused. The probe was
  tied to one machine's heading; it now asks about the first heading of `~/.claude/CLAUDE.md`
  read at run time (and only reads `init` when there is no such file); `~/CLAUDE.md` and
  `~/.cache/CLAUDE.md` are excluded too.
- Minor, fixed: UTF-8 split across chunks (`setEncoding`); `init` check now requires exactly the
  eight tools (`Agent` is `Task` in the event) and no MCP server (stored in `meta.init`); the
  environment also drops every `ANTHROPIC_*`, `CLAUDE_CODE_USE_*`, `CLAUDE_CONFIG_DIR`,
  `CLAUDECODE` and `NODE_PATH` entries in the repo, and the repo and cache are `realpath`ed;
  `init` is checked before the timeout (a hang before `init` is `failed`), timers are cleared;
  `--tasks` deduplicated and non-empty, `--budget Infinity` refused, pack, install and missing
  tarball failures exit 2, `--dry` checks a `--tarball` hash; `copyTree` filters only top-level
  names; README corrected (`text`, truncated `stderr.log`, `meta.task` not the folder name,
  enumerate `<config>`, only `meta.json` guaranteed) and `AGENTS.md` has the command.
- Left, with the reason: other secrets in the environment (`GITHUB_TOKEN`, `AWS_*`) still pass
  through, since the agent's `git`/`gh` use is outside this task and a list would be a guess; the
  README now says the agent can read sibling run folders (Bash is not sandboxed) instead of
  moving the records; a grandchild that detaches with `setsid` and holds the pipe could still
  keep a run open past its limit (the process-group kill covers the normal case).
