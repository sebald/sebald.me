---
status: todo # todo | doing | done
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
