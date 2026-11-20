# Blip UI eval

Measures what each piece of Blip UI's harness does for a coding agent
(`docs/blip-harness/spec.md`, section 3). Run by hand, never in CI.

```
evals/blip/
  tasks/<id>/task.md       the prompt, written like a ticket
  tasks/<id>/rubric.json   what the judge checks, and the URLs to screenshot
  collect.mjs, lib/        the collector (below)
  fixtures/                hand-made runs the collector's tests read
  results/<date>-<label>/  results.json and summary.md, the only files committed
```

The six tasks: `shop`, `saves`, `pause`, `fight-hud`, `quests`, `camp-rest`.

## `task.md`

The whole file is the agent's prompt, sent as it is: no frontmatter, nothing
for the eval in it. It reads like a ticket someone on the team wrote:

- What the player can't do today, then what to build, as a short list
- The screen's name to register in `src/screens/index.ts`, and the URL that
  opens it (`camp-rest` changes `camp` and says so)
- The game's own data and actions by name, where the screen should use them
- Never a Blip component, a rule or the CLI. A ticket says what the player sees
  and does ("can't be bought", "ask first"), not how it is built. That rules out
  the components' names as plain words too (menu, window, dialog, button, tabs,
  meter, title, text, line, step), so a word in the ticket never points at a
  component
- Never what the rubric marks `unstated`

## `rubric.json`

```json
{
  "task": "shop",
  "scope": "all",
  "urls": [{ "id": "start", "url": "?screen=shop&state=start" }],
  "statements": [
    {
      "id": "gold",
      "text": "The player's gold is shown, as 120.",
      "unstated": false,
      "from": "screenshot",
      "screenshot": "start@wide"
    },
    {
      "id": "nothing-to-sell",
      "text": "With an empty pack, selling says there is nothing to sell, instead of showing an empty list or empty space.",
      "unstated": true,
      "from": "diff",
      "url": "empty",
      "note": "For the judge only."
    }
  ]
}
```

| Field                     | What it is                                                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task`                    | The folder's name                                                                                                                                                                             |
| `scope`                   | `all`, or `changed-lines`: `validate`, the raw tag and `className` counts and the rendered checks count only lines the agent changed, so a screen that was messy before isn't held against it |
| `urls`                    | What the rendered layer opens, each wide (960 × 600) and on a phone (402 × 714). `id` names the screenshot; `url` is the query, always `?screen=<name>&state=<fixture>`                       |
| `statements`              | 3 to 6, at least one `unstated`                                                                                                                                                               |
| `statements[].id`         | Unique in the task, stable: results refer to `<task>/<id>`                                                                                                                                    |
| `statements[].text`       | One claim, answered yes or no. Names the fixture's values where it helps the judge ("as 120", "Wren 42/50")                                                                                   |
| `statements[].unstated`   | `true` when the ticket doesn't ask for it and a careful developer would do it anyway. Reported on their own                                                                                   |
| `statements[].from`       | `screenshot` or `diff`: the one thing the judge answers it from                                                                                                                               |
| `statements[].screenshot` | With `from: screenshot`: `<url id>@wide` or `<url id>@phone`                                                                                                                                  |
| `statements[].url`        | With `from: diff` and `unstated: true`: the URL id whose fixture puts the game in that situation, so every unstated case can be opened and looked at                                          |
| `statements[].note`       | Optional, for the judge: what the diff alone doesn't show (what an unchanged file already does)                                                                                               |

A statement the judge and I disagree on twice is badly written and is
rewritten (spec Q14). A statement that a parser or the rendered layer already
measures (layout escapes, cut text, axe) is not a rubric statement, apart from
the phone layout of `fight-hud`, which asks whether the HUD still makes sense,
not whether something escapes.

## What the template holds for the tasks

`src/game/data.ts` (the `template` task builds it):

| Name                     | Content                                                                                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ITEMS`                  | `id`, `name`, `description`, `price`, `sellPrice` (half, rounded down): Herb 8, Rope 12, Lamp Oil 15, Tonic 25, Leather Cap 60, Iron Sword 150                                                                                                                |
| `SHOP_STOCK`             | The ids of all six                                                                                                                                                                                                                                            |
| `REST_COST`              | 20                                                                                                                                                                                                                                                            |
| `STATUSES`               | `poisoned`, `asleep`, `guarded`, each with a label                                                                                                                                                                                                            |
| `ENEMIES`                | Bog Rat (20 HP), Marsh Wisp (9 HP)                                                                                                                                                                                                                            |
| `QUESTS`                 | `id`, `name`, `giver`, `description`, `steps` (strings): The Lost Ferry (Ferrywoman Maud; Ask in Mossy Ford about the ferry, Search the reeds south of the ford, Bring the ferry back), Wolves at Hollow Gate (Gatekeeper Tam), Herbs for Old Bess (Old Bess) |
| `DEFAULT_OPTIONS`        | `music` 7, `sound` 5 (0 to 10), `messageSpeed` `'normal'` (`'slow' \| 'normal' \| 'fast'`)                                                                                                                                                                    |
| `FIXTURES` (the `state`) | Whole game states by name, below                                                                                                                                                                                                                              |

A game state: `place`, `playtime` (seconds), `gold`, `party` (`id`, `name`,
`role`, `level`, `hp`, `maxHp`, `mp`, `maxMp`, `statuses`), `pack` (item id and
count), `quests` (quest id, `step`, `done`), `slots` (three, each `null` or
`place`, `leader`, `level`, `playtime`, `savedAt` as an ISO string), `options`,
`fight` (`null`, or `enemies` with `hp` and `maxHp`, and `turn`, a member's id).

| Fixture  | What it is                                                                                                                                                                                                                                                                                                 | Used by                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `start`  | Mossy Ford, 3:25 played, 120 gold. Wren (fighter, 4) 42/50 HP 6/10 MP, Oda (mender, 4) 18/34 21/30, Pim (scout, 3) 27/38 4/12. Pack: Herb ×3, Rope, Tonic. The Lost Ferry on its second step, Wolves on its first, Herbs done. Slot 1 holds Mossy Ford, Wren, 4, 3:25, 2 November; 2 and 3 empty. No fight | all six                   |
| `exact`  | `start` with 25 gold, the Tonic's price                                                                                                                                                                                                                                                                    | `shop`                    |
| `broke`  | `start` with 5 gold, less than `REST_COST` and the cheapest item                                                                                                                                                                                                                                           | `camp-rest`               |
| `empty`  | A new game: 50 gold, the party at full HP and MP, empty pack, no quests, all three slots empty                                                                                                                                                                                                             | `shop`, `saves`, `quests` |
| `full`   | `start` with all three slots holding a save (Hollow Gate, Wren, 3, 2:01; Reedmarsh, Wren, 4, 3:53)                                                                                                                                                                                                         | `saves`                   |
| `fight`  | `start` in a fight with the Bog Rat (14/20) and the Marsh Wisp (9/9), Oda's turn, Wren poisoned                                                                                                                                                                                                            | `fight-hud`               |
| `fallen` | `fight` with Pim at 0 HP. Nothing else marks Pim as fallen: 0 HP is the state                                                                                                                                                                                                                              | `fight-hud`               |

What the tickets assume beyond `data.ts`:

- `src/game/state.ts` has `buy`, `sell`, `save`, `load`, `rest`, `setOption`
  and `leaveRun`. `buy`, `sell` and `rest` refuse what the state doesn't allow
  and say why (`{ ok: false, reason: 'gold' | 'none' }`); none of them asks the
  player anything, which is the screen's job
- `src/screens/camp.tsx` shows the place, the gold and the party, and has a
  short list of things to do at camp (look around, talk) moved through with
  arrow keys and Enter in a `keydown` listener on `window`. `pause` depends on
  that listener: a pause screen on top doesn't stop it on its own. A Blip `Dialog`
  keeps the arrow keys from it while focus is inside, but not Enter

## Building the template

`evals/blip/template/` is not a workspace package (it has its own empty-ish
`pnpm-workspace.yaml`, and the root `tsconfig.json`, `.oxlintrc.json` and
`.oxfmtrc.json` exclude it). It builds against the packed Blip UI, never the
workspace source. By hand:

```bash
pnpm --filter @sebald/blip-ui pack --pack-destination /tmp/blip
cp /tmp/blip/sebald-blip-ui-*.tgz evals/blip/template/blip-ui.tgz   # git-ignored
cd evals/blip/template && pnpm install && pnpm typecheck && pnpm build
```

`blip-ui.tgz`, `node_modules`, `dist` and the lockfile are git-ignored; `run.mjs`
puts the tarball in place and keeps the lockfile per run.

## Running a task

```bash
pnpm eval:blip --label day-zero --config cli --tasks pause --reps 1   # --dry prints and spends nothing
```

The label's base install is type-checked and built before any agent starts, and the
label stops (exit 2) when either fails: inside this repo the template borrows types
from the root's `node_modules`, so only a check in the cache shows what an agent gets.

`run.mjs` (spec 3.3): `--label`, `--config` (`no-cli`, `cli`; `plan`, `hook`,
`reviewer`, `full` stop with "not built yet"), `--tasks a,b` (default all),
`--reps n` (default 1), `--model` (default `claude-sonnet-5-5`), `--budget`
(`--max-budget-usd`, default 4), `--timeout` (minutes per run, default 30),
`--tarball f` (else the workspace is packed), `--parallel n` (default 1),
`--retry-failed`, `--accept-baseline`, `--dry`. Exit 0, 1 when a run failed, 2 on bad input or a
configuration not built, 3 when the label stopped (canary or usage limit).

Runs on the logged-in subscription. The child's environment (also `pnpm`'s and
`git`'s here) is an allowlist, `ENV_ALLOW` in `run-lib.mjs`: `PATH` (this repo's
entries removed), `HOME`, `USER`, `LOGNAME`, `SHELL`, `LANG`, `LC_*`, `TERM`, `TZ`,
`TMPDIR`, `__CF_USER_TEXT_ENCODING`, `XDG_{CONFIG,CACHE,DATA,STATE}_HOME`, the proxy
variables (`HTTP(S)_PROXY`, `NO_PROXY`, either case), `SSL_CERT_FILE` and
`NODE_EXTRA_CA_CERTS`. `HOME` and `USER` are how Claude Code finds the login (checked
with the canary: `apiKeySource` is `none` with these alone, even when the caller
has `ANTHROPIC_API_KEY` set). Everything else is dropped: every key and token,
`ANTHROPIC_*`, `CLAUDE_*`, `GITHUB_TOKEN`, `AWS_*`, `NODE_PATH`, `npm_*`, `PNPM_*`.
It adds `PWD` (the run's folder) and `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`. A tool
that needs another variable fails visibly; add it to the list. `BLIP_EVAL_CACHE` moves the cache (never
into the repo), `BLIP_EVAL_CLAUDE` names another executable for `claude`
(a test stand-in). The pure helpers' tests (`run-lib.test.mjs`) run in `pnpm test`.

### What it leaves in the cache (what `collect.mjs` reads)

```
~/.cache/blip-eval/<label>/
  label.json                         the label's tarball and the canary's baseline (below)
  tarball/*.tgz                      the one tarball every run of the label installs
  .base/ .canary/ .tmp/              working folders, not runs
  <config>/<task>-<n>/               one run, n from 1: the template, installed, with the agent's changes
    transcript.jsonl                 the child's stdout, one stream-json event per line, unchanged
    meta.json                        below; written last
    stderr.log                       only when the child wrote to stderr
```

- A run directory is a git repository with one commit, `template`, made before
  the agent started; the agent's changes are `git status` / `git diff template`
  against it. `transcript.jsonl`, `meta.json` and `stderr.log` are in
  `.git/info/exclude`, `node_modules/`, `dist/` and `*.tgz` in `.gitignore`.
  The records are moved in after the child ends, so the agent cannot read its own
  transcript (Bash is not sandboxed, so it could still list sibling run folders
  and `<label>/.tmp/`; nothing in a prompt points it there).
- **A directory without `meta.json` is unfinished and is to be skipped.** A run
  is a result when `meta.status` is `done` or `timeout`; `failed` is a run that
  could not be measured (setup, the `init` check, no `init` or `result` event, an
  error result such as a login or API error), `stopped` one that hit the
  subscription's usage limit. The collector counts only `done` and `timeout`.
  Only `meta.json` is guaranteed: a run that failed in setup has no
  `transcript.jsonl` and maybe no `.git`; `stderr.log` keeps the last 2000
  characters. Task names contain hyphens (`fight-hud-1`): read `meta.task` and
  `meta.rep`, never parse the folder name. `<label>/` also holds `tarball/` and
  `label.json`: list `<config>` by the configuration names, not by every
  subdirectory.
- `pnpm install` per run is offline from `pnpm-lock.yaml` (kept from the
  label's base install); `no-cli` has `node_modules/.bin/blip` removed.
  Nothing in the folder resolves into this repo (checked before the agent
  starts, symlinks and the lockfile's paths).

`meta.json`:

| Field                                | Content                                                                                                                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`, `config`, `task`, `rep`     | Which run (`rep` from 1)                                                                                                                                                         |
| `model`, `budgetUsd`, `timeoutMin`   | What was asked for                                                                                                                                                               |
| `tarball`                            | `sha256`, `version`, `commit` (null with `--tarball`): the same for every run of a label                                                                                         |
| `claudeVersion`                      | `claude --version`                                                                                                                                                               |
| `startedAt`, `endedAt`, `durationMs` | ISO times, wall clock including setup                                                                                                                                            |
| `exitCode`, `signal`                 | The child's                                                                                                                                                                      |
| `status`                             | `done`, `timeout`, `failed`, `stopped`                                                                                                                                           |
| `failure`                            | Why, when `failed`; else null                                                                                                                                                    |
| `timedOut`                           | Ended by the wall-clock limit (`status: "timeout"`)                                                                                                                              |
| `stoppedBy`                          | `"usage-limit"` or null. A run with it is redone from a fresh copy, never a result                                                                                               |
| `overBudget`                         | The result event was `error_max_budget_usd`                                                                                                                                      |
| `init`, `initProblems`               | What the `init` event loaded by name (`apiKeySource`, `model`, `plugins`, `skills`, `agents`, `tools`) and what the check found wrong (empty when fine)                          |
| `result`                             | From the `result` event: `subtype`, `isError`, `costUsd` (an estimate at API prices), `turns`, `apiMs`, `usage`, `text` (the message, on an error result only); null without one |
| `installMs`, `baseCommit`            | The offline install's time; the `template` commit's hash                                                                                                                         |
| `redoOf`                             | null for a first run; why it was redone otherwise                                                                                                                                |

`label.json`: `label`, `createdAt`, `claudeVersion`, `tarball` (`file`, `sha256`,
`version`, `commit`, `dirty`), `baseline` (the plugins, skills, agents, tools and MCP servers Claude
Code itself loaded in the canary's `init`; checked by the next canary),
`acceptedBaselines` (the canary runs with no tools, so `tools` there is the canary's; the per-run tools check covers the runs; only after `--accept-baseline`: `at`, `claudeVersion`, `from`, `to`, so a
reader sees that runs within the label differ) and `canary`. A
label is built from one tarball for good: rerunning it reuses that file, and
`--tarball` with another hash is refused. It is also built on one Claude Code:
another major or minor `claudeVersion` is refused.

### Skipping and resuming

Rerunning a label and configuration skips every run whose `meta.json` says
`done` or `timeout` (and `failed`, unless `--retry-failed`). A run that is
`stopped` by the usage limit, has no `meta.json`, or is `failed` with
`--retry-failed` is deleted and redone from a fresh copy. When one run hits the
usage limit the label stops: no further run is started (those already running
finish), and the exit code is 3.

### Two checks before and during a label

- **The canary** (Q7), once per invocation that has work to do: an empty
  folder in the label's cache, the same flags, one question about the first
  heading of `~/.claude/CLAUDE.md` (read at run time; with no such file it only
  reads `init`). If the answer is yes, the `init` event's `apiKeySource` is not
  `none`, or anything it loaded comes from `~/.claude` or an MCP server, nothing
  runs. Its `init` is the label's `baseline`. A later invocation stops
  (exit 3, nothing runs) on another major or minor Claude Code version than the label began on, and
  when what Claude Code loads (plugins including built-in ones, skills, agents, tools, MCP
  servers) differs from the recorded baseline: it prints what was added and removed per kind.
  Use a new label, or `--accept-baseline` to continue; the old and new set, the Claude Code
  version and the time are then appended to `acceptedBaselines` in `label.json`. Nothing
  changed (the usual `--retry-failed` rerun): no flag needed. On Claude Code 2.1.329
  `--setting-sources project` alone does **not** keep that file out (the canary
  said yes), so every run's and the canary's `.claude/settings.json` also lists
  `claudeMdExcludes` for `~/.claude/CLAUDE.md`, `~/.claude/rules/**`, `~/CLAUDE.md`
  and `~/.cache/CLAUDE.md` (the home directory written in at run time). A run's `settings.json` is therefore not
  "permissions only" as spec 3.3 says.
- **The `init` event** of each run, as it arrives: `apiKeySource` must be
  `none`, nothing may come from `~/.claude`, the tools must be exactly the eight of
  the command line (`Agent` shows as `Task`) and no MCP server may be loaded.
  Built-in plugins, skills and agents are allowed whatever their names (Claude
  Code adds one every few releases; `cc-plugin-easel` failed 2 of 64 runs of day
  zero when a list of names was checked). A plugin is built in only when its own
  entry says so (`path: "builtin"` or a `source` ending `@builtin`; kept per entry in
  `meta.init.pluginEntries`), never by its name: a user plugin named like a
  built-in one fails. A plugin that is neither built in nor `blip-ui` in a
  configuration that has it fails. The check fails closed: an event without a
  plugin list, or whose plugins carry no `path` or `source` at all, fails the run
  (and the canary) instead of assuming they are built in. Skills and agents are bare names in the event, so
  they are compared by name, at run time, with what lives in `~/.claude` (the
  plugins in `installed_plugins.json`, `skills/`, `agents/`): a match fails the run On a problem the
  child is killed at once and the run is `failed` with the reasons in
  `initProblems`.

## Collecting

`node evals/blip/collect.mjs --label <label>` reads a label's run directories and writes
`results/<date>-<label>/results.json` and `summary.md`, nothing else in the repo; any other `*.md`
in that folder is a hand-written write-up, left alone, and `summary.md` links to it ("Write-ups")
so a re-collect doesn't lose it. It never reruns an
agent and never writes into a run (`tsc` and the build only add `dist/` there). Options:
`--cache <dir>` (default `~/.cache/blip-eval`), `--out <dir>` (default `evals/blip/results`),
`--date`, `--skip-build` (no `tsc`, no build, and so no rendered pass), `--skip-render` (everything but the rendered pass), `--against <results dir>`. Its tests
(`collect.test.mjs`) run in `pnpm test`; `node evals/blip/fixtures/build-cache.mjs <dir>` builds a
cache from the fixtures to try it by hand.

**The run layout it reads** is eval-run's ("What it leaves in the cache", above), nothing more:

- `<cache>/<label>/<config>/<dir>/` is the agent's project, with `meta.json` written last and
  `transcript.jsonl` beside `src/`. Task and rep come from `meta.task` and `meta.rep`, never from the
  folder's name. `<label>/tarball/` and dot folders are not configurations
- Only `meta.status` `done` and `timeout` are results. `failed`, `stopped`, a folder without
  `meta.json` (unfinished) and a result run without `transcript.jsonl` are skipped, and
  `summary.md` and `results.json` (`skipped`) list each with its reason
- Blip's identity is `meta.tarball` (`version` and the first 12 characters of `sha256`), which is
  the same for every run of a label; without it, the `version` in the installed package plus a hash
  of its `dist` and `docs`. More than one in a label is an error. Imports are checked against
  `node_modules/@sebald/blip-ui/docs/manifest.json`; without it, invented imports are `null` (not
  measured, and `summary.md` says so)
- The first commit of the run's git repository is the template; changed lines are against it
- A result run whose transcript has no `result` event, or ended on the usage limit, is `incomplete`:
  listed, left out of every median
- The task's `scope` is read from `tasks/<task>/rubric.json` in this repo

**What it counts**

- Transcript: tool calls by tool; `blip` calls by command (`blip`, `pnpm exec blip`,
  `node_modules/.bin/blip`, in any `&&`, `;` or `|` part of a command); calls that look into
  `node_modules/@sebald/blip-ui/dist` or `/docs` (a Read, Glob, Grep or a Bash command naming the
  path); whether a lookup (a `blip` call other than `validate`, or such a read) came before the
  first write of a `.ts` or `.tsx` file (a Write or Edit, or a Bash command that redirects into one,
  heredocs included, or uses `tee`, `cp`, `mv` onto one, or `sed -i`); `error TS` lines in Bash results; turns, tokens, cost and
  time from the final `result` event; permission denials; `error_max_budget_usd` as over budget.
  A message split over several events is counted once (by `message.id`); a subagent's messages
  (those with a `parent_tool_use_id`) are summed apart as `subagents`
- Network (Q2): a command (found outside quotes and heredocs, through `env`, `timeout`, `xargs`,
  `sudo` and `bash -c`) that is `curl`, `wget`, `gh`, `npm|pnpm|yarn|bun view`, `info`, `show`,
  `search`, `add`, or `install`/`i` with a package named (a bare `install` works from the
  lockfile and is not flagged), `pnpm dlx`, `npx <package>` (not `blip`, `tsc`, `vite`, `oxlint`),
  `node|python -e/-c` code that fetches, `git clone|fetch|pull|push`, and the `WebFetch` and
  `WebSearch` tools. Flagged runs are counted like the others and listed apart
- Tree: `tsc --noEmit` and `vite build` with what the run installed (not run: `ran: false`, not a
  failure); raw tags, split into those Blip has a component for (`button`, `input`, `select`,
  `textarea`, `dialog`, `progress`, `meter`, `h1` to `h6`, `ul`, `ol`, `menu`, `table`, `nav`,
  `details`, `summary`: `controls`) and the rest (`wrappers`); JSX elements by where they come from
  (`blip`, `own`: a relative or `@/` import or one declared in the file, `other`); `className`s
  with their classes split into placing (position, size, grid, flex, margin, gap, overflow) and
  restyling (everything else, padding included), without the test of a conditional (`s === 'open' ? 'a' : 'b'` has two); `style` props; value imports from
  `@sebald/blip-ui` that are not exports. The files are parsed (`oxc-parser`), not matched by regex
- `scope: all` counts all of `src/`; `changed-lines` counts an element, a `className` or an import
  only when its line (the opening tag's, the attribute's) is added or changed since the run's root
  commit, committed or not, and every line of a file the agent added
- Overrides that recur (Q11): per changed `className` on a Blip component or a raw tag, the
  element and its sorted restyling classes (variants kept); a bare raw control has none. Per
  changed inline `style` object literal, the element and its declarations, sorted by key; a value
  that names something (`'absolute'`, `0`) as written, a tuned or computed one (`'calc(var(--px) * 4)'`,
  `8`, `tall ? 'column' : 'row'`) as `*`, since the same frame is never written with the same gap
  twice (day zero's 21 frames had 18 different ones); a spread as written; `style={frame}` has none to compare. A group
  in at least 3 runs of one label across at least 2 tasks is a candidate. Taken from changed
  lines whatever the scope, so a file the agent never touched can't make one

`results.json` records the collector's commit (`+dirty` with uncommitted edits to it) and the
CLI's version. `--against` puts another label's overall numbers beside this one in `summary.md`
only when both match; otherwise it says which differs and to collect again. Every process the
collector starts has `BLIP_EVENTS=off`; the collector never reads or writes `.blip/`.

### The rendered pass

`lib/rendered.mjs` (spec 3.5, layer 2; measure 4), run by `collect.mjs` after the build unless
`--skip-render` or `--skip-build`. Needs Chrome (the installed one, as the game's tests; the
Playwright image's on Linux).

- Per run: `vite build` where there is no `dist`, a static server on a free port over `dist`
  (a path without a file is `index.html`), and each `urls[].url` of the task's `rubric.json` opened
  in a fresh page wide (960 × 600) and on a phone (402 × 714, a touch device, `isMobile`),
  `reducedMotion: reduce`, once the fonts are ready and 500 ms later
- On the stage (`section[data-slot="stage"]`): `escapes()` from
  `packages/blip-ui/tests/visual/layout.ts` (the file the Blip UI story tests use; its root is now a
  parameter, `#storybook-root` by default), and axe (`axe-core`, whole page). `escapes()` lists the first
  50 faults (`limit`; the stories keep its default of 3); they are split into **escapes** (a part outside the stage) and **cut text** (`"…" cut by …`).
  Axe is recorded as `{ id, impact, nodes }` per violated rule
- A URL that does not render (the page threw, the stage stayed empty, `No screen called …`, the project
  does not build) is `rendered: false` with its `reason`, has no faults, and does not stop the others
- Screenshots: `<cache>/<label>/.screenshots/<config>/<run dir>/<url id>@wide.png` and `@phone.png`, one
  per URL and viewport, also for a page that did not render (what the judge is given). Rewritten on
  every collect. `results.json` names them (`runs[].rendered.screenshots`, `pages[].screenshot`), no
  absolute path
- `scope: changed-lines`: the template (the run's first commit, built once per label with the run's
  own `node_modules`) is opened on the same URLs, and what it shows is taken off: faults by what they
  are without their distance, axe by rule and node count. `subtracted` on the page says how many
  entries went. If the template itself cannot be rendered nothing is taken off
- Measures: share of runs with every URL rendered, and escapes, cut text and axe violations (rules)
  per run, wide and on a phone, medians over the runs of a task. Their detail is in
  `summary.md`, "Rendered pages to look at"
- Not covered: baselines or comparisons, and anything past the first screen of a URL (no input is sent)
