# Blip UI harness: spec

Status: a plan for review. Nothing here is built. Where the code contradicts a decision, the
decision stands in this file and the conflict is in `open-questions.md` (marked **Q** below).

## 1. Goal

Find out what makes a design system easy and reliable for a coding agent to use, and write
about it. Blip UI (`packages/blip-ui`) gets a harness: rules an agent can look up and be checked
against, a CLI that serves docs, examples and rules, a check on every edit, a reviewer at the
end of a turn, and drafts for what the design system is missing. An eval measures each piece on
its own, one change at a time, with the Blip version held fixed.

Mechanisms are plain ones other design systems could copy (a CLI, JSON, markdown, YAML, a
parser, `tsc`, git). Blip is the only design system served; nothing is made generic.

## 2. Architecture

### 2.1 The package

One package, `@sebald/blip-ui`, one version for code, CLI, rules and docs.

```
packages/blip-ui/
  src/                         as today, plus:
    **/<page>.blip-rules.yaml    rule sidecars, next to their MDX page
    components/<name>/examples/  example .tsx files, imported by the stories
    patterns/<name>.mdx          pattern pages (none today; Q12), with sidecar and examples
    correctness.blip-rules.yaml  the X rules, which have no page
  cli/                         Node code, TypeScript, outside src
    bin.ts                       argument parsing, dispatch
    commands/                    search, docs, examples, rules, validate, review, gap, hook, init
    validate/                    parser, checks/, changed lines, findings
    build/                       the pack step: pages, manifest, rules, examples
  plugin/                      the Claude Code glue (2.6)
  research/                    not in the tarball (section 4)
  dist/  docs/                 generated at pack time, ignored by git
  README.md                    new: what a consumer reads first, names `pnpm exec blip`
```

`src` keeps its own rules (no assets, no `next/*`, uniformity); `cli/` is outside them
(`uniformity.test.ts:16` reads `src/components` only).

**The tarball** (`files` in `package.json`): `dist/`, `docs/`, `plugin/`, `README.md`. No `src/`,
stories, MDX, tests or baselines. Today a tarball holds all of them, 1.2 MB with 154 screenshots
(checked with `pnpm pack`, which works on the private package).

**Inside the repo nothing changes**: `exports` keeps pointing at `src/` (`package.json:10-16`),
so the site and Pushback compile the source as before. `publishConfig` swaps `exports` to
`dist/` and adds `bin: { blip: dist/cli/bin.js }` when the package is packed.

**The pack step** (`prepack`, run by `pnpm pack`):

1. `tsc -p tsconfig.build.json` (tsgo, TypeScript 7) emits `dist/` from `src/` and `cli/`: one
   `.js` and `.d.ts` per source file, no stories or tests. Unbundled on purpose: `'use client'`
   stays per file and the class strings stay literal, which the CSS needs (below). Checked:
   the 63 source files of `src/` in 1.4 s. **Q3**
2. `styles.css` and `tokens.css` are copied to `dist/`. They are Tailwind v4 source
   (`styles.css:6-12`: `@source`, `@custom-variant`, `@utility`, `@theme`), so a consumer
   compiles them with Tailwind as the site does (`src/css/styles.css:8`). **Q4**
3. `node dist/cli/build/index.js` writes `docs/` (2.3).

CLI code, and the modules it imports from `src/foundations`, write their relative imports with
the `.ts` extension, rewritten to `.js` on emit (`rewriteRelativeImportExtensions`, checked on
7.0.2), so the emitted CLI runs in Node without a bundler. Node does not strip types inside
`node_modules`, so the CLI ships as JavaScript.

**Dependencies.** Runtime: what Blip has today plus `oxc-parser` for `validate`'s fast pass.
`typescript` is an optional peer, for the compiler pass only: TypeScript 7 has no in-process
parser, so the CLI runs the project's `tsc` binary instead of importing it. **Q1**. Pack-time
only (`devDependencies`): `yaml`.

**Readable types.** Props that pick from options declare them as literal unions, and the cva
config is checked against them with `satisfies`, so the emitted `.d.ts` shows the values
(`variant?: 'primary' | 'secondary' | 'destructive'`, not `NonNullable<Variants['variant']>`).
**Q5**

Repo config that has to follow: `cli/**` joins `packages/blip-ui/tsconfig.json` (`:19-25` list
`src`, `.storybook`, `tests`) and the root `test:lib` glob (`package.json:56` matches
`packages/*/src/**` only); `packages/blip-ui/{dist,docs}` and `evals/blip/template` are excluded
from the root `tsc` (its `include` is `**/*.ts(x)`), from oxlint and from oxfmt.

### 2.2 Rules

A sidecar holds the consumer rules of one page:

```yaml
# src/components/dialog/dialog.blip-rules.yaml
page: dialog
rules:
  - id: C-DIALOG-1
    text: Give every Dialog a Title.
    severity: error
    check: dialog-title
    fix: |
      <Dialog open={open} onOpenChange={setOpen}>
        <Title>Options</Title>
      </Dialog>
  - id: C-DIALOG-2
    text: Use role="alertdialog" (or Confirm) before something that can't be undone.
    markers: [review]
when-not:
  - text: A line a character says is a SpeechBubble, not a Dialog.
    use: speech-bubble
```

| Field      | Meaning                                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | `<kind>-<scope>-<n>`, never reused. Kinds: `C` component usage, `P` pattern, `A` accessibility, `T` text and content, `F` foundations (colour, length, spacing, text size, motion, layers), `X` correctness. **Q9** |
| `text`     | One sentence, one requirement. A rule that could be half met is two rules                                                                                                                                           |
| `severity` | `error` or `warning` (default)                                                                                                                                                                                      |
| `check`    | The name of a check in `cli/validate/checks/`. Absent on a marked rule                                                                                                                                              |
| `markers`  | `[review]`: no tool can check it, the reviewer does. `[open]`: an unanswered question, never enforced, hidden from `blip rules`                                                                                     |
| `fix`      | A corrected snippet. Required with `check`                                                                                                                                                                          |
| `source`   | A link. Required on research candidates, kept when a rule moves into a sidecar                                                                                                                                      |
| `when-not` | Per page: when not to use it, and what to use instead (`use`: a page id)                                                                                                                                            |

The pack step fails on: a duplicate id, an id not matching its kind and page, a rule with
neither `check` nor a marker, a `check` that does not exist, a check no rule names.

MDX pages render rules with two blocks, `<Rules for="dialog" />` (all of a page's, by kind) and
`<Rule id="C-DIALOG-1" />` (one, inline). The prose around them says why and never restates a
rule. The blocks live in `.storybook/blocks/` and read the sidecars as raw text through Vite's
`import.meta.glob`; the pack step reads the same files from disk. Neither depends on the other.

Only consumer rules. The rules for building Blip stay in `building-components.mdx` and
`uniformity.test.ts`; that page is not shipped.

### 2.3 Generated files (`docs/` in the tarball)

| File                         | Content                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `manifest.json`              | `version`; `pages[]` (`id`, `kind`: component, pattern, foundation; `title`, `summary`, `file`, `exports[]`, `rules[]`, `examples[]`); `exports{}` by name (`page`, `kind`, `htmlProps`, `props[]`: `name`, `type`, `values[]`, `default`, `required`, `description`); `examples[]` (`id`, `page`, `title`, `file`) |
| `rules.json`                 | `version`; `rules[]` with every sidecar field plus `kind` and `page`; `whenNot{}` by page                                                                                                                                                                                                                           |
| `pages/<id>.md`              | One markdown file per MDX page                                                                                                                                                                                                                                                                                      |
| `examples/<page>/<name>.tsx` | The example files, imports rewritten to `@sebald/blip-ui`                                                                                                                                                                                                                                                           |

MDX to markdown is text substitution, not an MDX compile. The pages use three Storybook blocks
and nothing else outside code fences (counted: 24 `Meta`, 51 `Canvas`, 21 `Controls`):
imports and `<Meta>` are dropped; `<Controls>` becomes the props table from the manifest;
`<Canvas of={X.Story}>` becomes the example's source if the story renders an example file, else
it is dropped; `<Rules>` and `<Rule>` become lists; Storybook links (`?path=/docs/…`) become
`blip docs <page>`.

Props come from the type checker at pack time (`typescript/unstable/sync`, pinned, behind one
module), which also resolves what the source cannot write out, such as inherited HTML
attributes. Checked: it returns `"destructive" | "primary" | "secondary"` for `Button`'s
`variant`. The build fails on a public prop whose resolved type still holds an indexed access
or a `typeof`. **Q5**

Exports come from `src/index.ts`. An export on no page (today: `Stage.Center`,
`stage.tsx:216`, not in `stage.mdx`) is listed by the build as undocumented.

### 2.4 The CLI

`blip <command>`, text by default, `--json` everywhere. Exit 0, 1 for findings of severity
`error`, 2 for a usage error. Every command appends one line to `.blip/events.jsonl` (2.7),
except when `BLIP_EVENTS=off` is set: then nothing is written. The eval's collector always sets
it, so its own `validate` calls never mix with what the agent did.

| Command                                                            | Input                                         | Output                                                                                                                                                       |
| ------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `blip`                                                             | none                                          | The commands, and the index of pages by kind with one line each                                                                                              |
| `blip search <words…> [--limit n]`                                 | Free text                                     | Ranked pages, exports, rules and examples: id, kind, one line, the command that opens it. Scored over titles, summaries, headings, rule text; no dependency  |
| `blip docs <page \| export \| rule-id> [--section <name>]`         | A page id, an export name or a rule id        | The page as markdown (optionally one section: usage, props, rules, examples, input, accessibility). For a rule id: the rule, its page's reasoning, its fix   |
| `blip examples [<page>]`, `blip examples <id>`                     | A page, or an example id                      | The list, or one example's source                                                                                                                            |
| `blip rules [<page>] [--kind C\|P\|A\|T\|F\|X]`                    | Optional filter                               | Id, text, markers. `[open]` rules only with `--open`                                                                                                         |
| `blip validate <files…> [--changed-since <ref>] [--compiler]`      | `.tsx` files or globs                         | Findings (2.5). `--changed-since` keeps findings on changed lines or on elements enclosing them. `--compiler` adds the `tsc` pass                            |
| `blip review`                                                      | none (reads git and the event log)            | The reviewer's packet: `validate --compiler` over this turn's changed files, the `[review]` rules of the components used, attempts per finding, gaps drafted |
| `blip gap new --needed <text> --used <text> --file <f> --line <n>` | What was needed, what was used instead, where | Writes `.blip/gaps/<slug>.md`, prints its path                                                                                                               |
| `blip hook post-edit`, `blip hook stop`                            | The hook's JSON on stdin                      | The hook's reply on stdout and its exit code (2.6)                                                                                                           |
| `blip init`                                                        | none                                          | Enables the plugin in `.claude/settings.json` (**Q6**), writes `blip.config.json` if missing, adds `.blip/` to `.gitignore`                                  |

Day zero ships `blip`, `search` and `docs` only, over pages converted from today's MDX.

### 2.5 Findings, and how one travels from a sidecar to the agent

A finding, as the agent reads it:

```
src/screens/shop.tsx:42:7  error  C-BUTTON-1
  A screen has one primary Button; this is the second.
  fix: <Button variant="secondary">Sell</Button>
  ref: blip docs C-BUTTON-1
```

As JSON: `file`, `line`, `column`, `endLine`, `severity`, `rule`, `message`, `fix`, `ref`,
`anchor` (the lines of the element it is about), `fingerprint`, `attempts`.

The path of `C-DIALOG-1`:

1. **Authored** in `dialog.blip-rules.yaml`, with `check: dialog-title` and a `fix`. I review it.
2. **Rendered** on the Dialog page by `<Rules for="dialog" />`.
3. **Packed** into `docs/rules.json`; the check is compiled to `dist/cli/validate/checks/`.
4. **Looked up**: `blip docs dialog` lists it before any code is written (the plan step).
5. **Checked**: the agent writes a `.tsx` file. The hook runs `blip hook post-edit`, which
   parses the file, runs every check whose rule is not in `rules.off`, and gets a finding
   anchored to the `<Dialog>` element.
6. **Filtered**: changed lines are the hunks of `git diff -U0 -w HEAD -- <file>` (an untracked
   file is all changed). The finding is kept if a changed line lies inside its anchor
   element's lines. A fault in an untouched element of the same file is dropped. **Q8**
7. **Counted**: its fingerprint (rule, file, enclosing function, tag, ordinal) is looked up in
   the event log; `attempts` is how often it was reported before.
8. **Delivered** in the hook's reply, in the format above, and logged.
9. **Fixed or not**: the next edit runs the check again. A finding that is gone is logged as
   fixed. One still there after two attempts is no longer sent by the hook; the reviewer lists
   it under "needs a decision".
10. **Referenced**: `blip docs C-DIALOG-1` prints the rule, the page's reasoning and the fix.

Checks come in three kinds:

- **Structure**, one per rule, over the JSX tree: a `Dialog` without a `Title`, a disabled
  `PickerItem` without a `note`, a `Window` in a `Window`, a `Meter` without `aria-label`,
  `Tab` values without a matching `TabPanel`.
- **Correctness (X)**, from the manifest: an import from the package that is not an export, a
  prop a component does not have, a literal value outside `values`. No compiler needed.
- **Foundations**, over class strings and inline styles, as Blip checks itself: colours not
  through `--bui-*`, lengths not in stage pixels, spacing off the scale, text sizes off the
  scale, motion against the rule. The predicates exist: `transitionFaults` and `glidingArt` are
  exported for a game's tests already (`foundations/motion.ts:22,51`, used by
  `pushback/src/ui/motion.test.ts`); the spacing, text, opacity and layer predicates are inline
  in `uniformity.test.ts:64-190` and move into `src/foundations/` so the test and the CLI share
  them.

The compiler pass (`--compiler`, reviewer only) runs the project's `tsc --noEmit --pretty false`
and maps its diagnostics on Blip imports and props to the X rules, adding the allowed values
from the manifest; other errors pass through without a rule id.

A file that does not parse yields no findings and one `parse-failed` event.

### 2.6 The plugin

```
plugin/
  .claude-plugin/plugin.json
  hooks/hooks.json            PostToolUse (Write|Edit) -> blip hook post-edit
                              Stop                     -> blip hook stop
  skills/plan/SKILL.md        the plan step
  agents/reviewer.md          the reviewer
```

All logic is in the CLI. The hooks call `"$CLAUDE_PROJECT_DIR"/node_modules/.bin/blip` (the
hook's working directory is not documented); the skill and the agent say which commands to run
and what to do with the output, so another agent could be given the same commands.

The CLI speaks the hooks' protocol: it reads the hook's JSON from stdin (`tool_name`,
`tool_input.file_path`, `session_id`; for Stop also `stop_hook_active`) and answers with JSON
on stdout, exit 0. Findings go back as `hookSpecificOutput.additionalContext`, which the model
reads beside the tool's result without the edit counting as failed. That string is cut off at
10,000 characters, so a reply carries at most 5 findings and a count of the rest. Holding a
stop is `{"decision": "block", "reason": …}`.

- **Plan skill.** On a request to build or change a screen: `blip search` for what the screen
  is, `blip docs` for the pattern and each component it names, `blip examples` for the
  closest one, then code. If nothing fits, the closest fit and a gap draft.
- **`blip hook post-edit`.** For a `.tsx` file outside `node_modules`: steps 5 to 8 above,
  without the compiler pass, in under 2 s (the time is logged). Anything else: silent.
- **`blip hook stop`.** If `.tsx` files changed this turn and no review has run since the last
  edit, it holds the stop once and asks for the reviewer. With `reviewer: false`, or after two
  holds in one turn, it lets the turn end.
- **Reviewer agent.** Runs `blip review`, reads the changed code, judges the `[review]` rules,
  the component choice, composition, content and accessibility, fixes what it can, runs
  `blip review` once more, and returns at most 5 items in three groups: fixed, needs a decision
  (including every finding with two attempts), gaps. It runs as a subagent, so its tokens can
  be told apart.
- **Gap drafts.** When Blip has nothing that fits, the agent uses the closest fit, runs
  `blip gap new`, and ends the turn. Nothing is filed anywhere.

The eval loads the plugin with `--plugin-dir`, which needs no trust step and no marketplace
file. `blip init` enables it for a project through `.claude/settings.json`, which works only
in a folder the user has trusted and may need the decision's fallback (hook entries and two
pointer files). **Q6**

### 2.7 Config, events, gaps

- `blip.config.json`: `{ "rules": { "off": ["T-BUTTON-1"] }, "reviewer": false }`. Both optional.
- `.blip/events.jsonl`, append-only, one JSON object per line with `ts`, `event` and, from a
  hook, `session`. Events: `lookup` (command, arguments, results), `validate`, `hook`
  (file, ms, findings sent), `finding` (fingerprint, rule, attempts), `fixed`, `rules-off`,
  `review`, `gap`, `parse-failed`. No server, no telemetry.
- `.blip/gaps/<slug>.md`: what was needed, what was used, file and line.

## 3. The eval

Lives in `evals/blip/`. Not a workspace package, not in `pnpm test`, never in CI. Run by hand:
`pnpm eval:blip` (`run.mjs`, then `collect.mjs`).

### 3.1 The template

`evals/blip/template/`: a small made-up game, built with Vite, React and Tailwind v4, the
toolchain Blip's Storybook already uses (`.storybook/main.ts:2,11`).

| File                   | Content                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `package.json`         | Scripts `typecheck`, `build`, `preview`; Blip from the packed tarball; `react` at Blip's exact peer version |
| `src/game/data.ts`     | Items and prices, a party, quests, save slots, and named fixtures (`broke`, `empty`, `full`)                |
| `src/game/state.ts`    | The game's state and actions (buy, sell, save, load, rest)                                                  |
| `src/theme.css`        | Its own values for `--bui-*` on `[data-stage]`                                                              |
| `src/app.tsx`          | A `Stage` and a router-free screen switch: `?screen=<name>&state=<fixture>` opens a screen on a fixture     |
| `src/screens/index.ts` | The screens by name. A task says which name to add                                                          |
| `src/screens/camp.tsx` | The one existing screen, built without Blip: raw `div`s, inline styles, its own colours                     |
| `CLAUDE.md`            | Written per configuration by `run.mjs` (3.4): what the game is, the commands, how a screen is opened        |

### 3.2 Tasks

`evals/blip/tasks/<id>/task.md` is the prompt, written like a ticket. `rubric.json` holds 3 to 6
checkable statements, some marked `unstated`, and the URLs to screenshot. First set:

| Id          | Ticket                                          | Unstated requirements the rubric holds                        |
| ----------- | ----------------------------------------------- | ------------------------------------------------------------- |
| `shop`      | Buy and sell, show what the player can't afford | Empty inventory when selling; exactly enough gold             |
| `saves`     | Save and load with three slots                  | An empty slot can't be loaded; a full slot asks before saving |
| `pause`     | A pause menu with options                       | Leaving the run asks first; the game under it gets no keys    |
| `fight-hud` | The HUD in a fight                              | A fallen party member; the phone layout                       |
| `quests`    | A quest log, open and done                      | No quests yet                                                 |
| `camp-rest` | Add resting to the camp screen (the messy one)  | Not enough gold; only the changed lines are judged            |

Pushback is never task material.

### 3.3 A run

`run.mjs --label <l> --config <c> [--tasks …] [--reps n] [--model m] [--budget usd] [--tarball f]`

1. Packs Blip once (or takes `--tarball`) and records version, commit and tarball hash. A
   comparison between configurations uses one tarball.
2. Builds one install per label: template plus tarball, `pnpm install`, lockfile kept.
3. Per task and repetition: copies it to `~/.cache/blip-eval/<label>/<config>/<task>-<n>`,
   outside this repo, installs offline from the lockfile (its own `node_modules`), applies the
   configuration, `git init`, one commit.
4. Starts headless Claude Code there with the task as the prompt:
   `--output-format stream-json --verbose --setting-sources project --strict-mcp-config
   --permission-mode acceptEdits --tools "Bash,Read,Write,Edit,Glob,Grep,Skill,Agent"
   --allowedTools <the same list> --max-budget-usd <n> [--model]
   [--plugin-dir node_modules/@sebald/blip-ui/plugin]`, stdout to `transcript.jsonl`, a
   wall-clock limit, one run at a time unless `--parallel n`, auto memory off
   (`CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`), hook events in the stream (`--include-hook-events`).
   It runs locally on the logged-in Claude Code subscription: `ANTHROPIC_API_KEY` is removed
   from the child's environment. **Q13**
5. Checks the stream's first event (`system`/`init` lists the loaded `plugins`, `skills` and
   `agents` by name, and `apiKeySource`) against what the configuration should have loaded and
   `none`, and fails the run on anything else.
6. A run that ends on the subscription's usage limit is not a result: the label stops and the
   run is redone from a fresh copy after the reset. Runs already in the cache are skipped, so a
   label can be run over several days.

The tool list is the same in every configuration, so adding the reviewer does not also add
Claude Code's built-in subagents (**Q2**). The network is not sandboxed; the collector flags runs
that reach out (3.5). A probe before each label checks that the global `~/.claude/CLAUDE.md`
stays out, and stops the label if it doesn't (**Q7**).

**What the agent sees**, file by file, in the full configuration:

| Path                                     | What it is                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------- |
| `CLAUDE.md`                              | The game in a paragraph, the commands, `?screen=`, one line naming `blip` |
| `.claude/settings.json`                  | Permissions only                                                          |
| `src/**`                                 | The template (3.1)                                                        |
| `blip.config.json`                       | Absent unless the configuration sets one                                  |
| `node_modules/.bin/blip`                 | The CLI                                                                   |
| `node_modules/@sebald/blip-ui/README.md` | What Blip is, the import, the CSS line, `pnpm exec blip`                  |
| `node_modules/@sebald/blip-ui/dist/**`   | `.js`, `.d.ts`, `styles.css`, `tokens.css`, the compiled CLI              |
| `node_modules/@sebald/blip-ui/docs/**`   | `manifest.json`, `rules.json`, `pages/*.md`, `examples/**`                |
| `node_modules/@sebald/blip-ui/plugin/**` | Hooks, the plan skill, the reviewer                                       |
| `.blip/**`                               | Appears during the run: the event log, gap drafts                         |

What it cannot see: this repo, its `AGENTS.md`, Blip's source, stories and tests, Pushback, the
tasks' rubrics. Claude Code's built-in skills and agents load in every configuration (checked:
19 skills and 6 agents with `--setting-sources project`), the same for all of them.

### 3.4 Configurations

Switches in `run.mjs`, each adding one thing to the one before:

| Name       | Adds                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| `no-cli`   | The package with its docs; `.bin/blip` removed, no line about it in `CLAUDE.md` |
| `cli`      | `.bin/blip` and one line in `CLAUDE.md` naming it (**Q10**)                     |
| `plan`     | The plugin with the plan skill only                                             |
| `hook`     | The per-edit hook                                                               |
| `reviewer` | The Stop hook and the reviewer agent                                            |
| `full`     | Gap drafts                                                                      |

Not in v1: docs from a URL, Storybook's MCP instead of the CLI, the rendered pass in the
reviewer.

### 3.5 Judging

`collect.mjs --label <l>` reads each run directory and writes
`evals/blip/results/<date>-<label>/results.json` and `summary.md`, the only files committed.
Transcripts, screenshots and run directories stay in the cache.

Collecting never reruns an agent, so a label can be collected again whenever a layer or a check
is added: day zero is first collected with layer 1 only, then again as the rendered layer, the
judge and `validate` land. `results.json` records the collector's commit and the CLI version
it used, and two results are compared only when both match; otherwise the older one is
collected again first. Run directories are kept until the sweep's write-up is done.

**Layer 1, deterministic.** From `transcript.jsonl`: tool calls by tool, `blip` calls by
command, reads under `node_modules/@sebald/blip-ui/dist` and `…/docs`, TypeScript errors met on
the way, turns, tokens, cost, wall time, permission denials. From the result: `tsc` and the
build; `blip validate --compiler --changed-since <first commit>` run with the collector's own
copy of the CLI (so `no-cli` is measured the same way): errors and warnings by rule, invented
exports and props, colours, lengths and motion against the rules; raw HTML tags and `className`
counted and split (below). From `.blip/events.jsonl`: whether the hook ran for each edit, its
time, whether a lookup came before the first `.tsx` write, findings sent and fixed, attempts,
gap drafts. Network use: runs whose Bash commands reach out (`curl`, `wget`, `gh`, `npm view`,
installing a package) are flagged and reported apart. The reviewer's tokens come from the transcript: a subagent's messages carry the
`parent_tool_use_id` of the call that started it, and the final event's `usage` leaves
subagents out while `total_cost_usd` and `modelUsage` include them. A run that ends with
`subtype: error_max_budget_usd` is reported as over budget, not as a failure of the task.

Raw tags and `className` are reported, not failed: Blip has no layout component, so its own
compositions place everything with raw `div`s and classes (`together.stories.tsx:94,131,162`),
and Pushback has 144 `className`s in 17 files. The split: a raw tag that Blip has a component
for (`button`, a heading, a list of choices) against a wrapper; a class that places against one
that restyles. A restyle that recurs (the same classes on the same Blip component, or the same
raw tag and classes, in at least 3 runs across 2 tasks) is listed as a candidate variant, size
or component. **Q11**

**Layer 2, rendered.** `vite build`, serve, open each URL of the rubric wide (960 × 600; under
about 770 px the stage asks for a bigger window) and on a phone (402 × 714, as
`stories.spec.ts:38-44`), with Playwright. Run `escapes()` from `tests/visual/layout.ts` on the
stage (it takes `#storybook-root` today, `layout.ts:15`, and gets a root parameter) and axe.
Screenshots are kept, not compared to baselines.

**Layer 3, rubric.** An LLM judge gets the task, the rubric, the diff and the screenshots, and
answers each statement with pass or fail and the evidence. I read every failed run and a sample
of the passing ones; the judge's agreement with me on that sample is reported.

### 3.6 Success measures

Reported per configuration, per task and overall, as medians with the spread across
repetitions, beside the same numbers for the configuration before it:

1. **It builds**: share of runs with `tsc` and the build clean.
2. **It uses Blip correctly**: `validate` errors and warnings per run, by kind; invented exports
   and props.
3. **It does the job**: rubric statements passed, with the unstated ones on their own.
4. **It renders**: layout escapes, cut text and axe violations, wide and phone.
5. **It reuses**: Blip components used against components of its own and raw controls.
6. **It looks things up**: runs with a lookup before the first `.tsx` write; `blip` calls; reads
   of `dist` and `docs`.
7. **What it costs**: tokens, dollars, turns, time; the reviewer's share; the hook's time.
8. **The harness does its part**: edits the hook ran on, findings fixed in the turn, attempts,
   "needs a decision" items, gap drafts and how many name a real gap (read by hand).

A piece helps when 2, 3 or 4 move by more than the spread between repetitions of one
configuration. 7 is reported beside every gain. For `hook` and `reviewer` that has to be 3 or
4: both act on what `validate` reports, and the same `validate` measures 2, so their gain there
is expected by construction and is reported beside the claim, not as it.

## 4. Research

In `packages/blip-ui/research/`, alongside the eval's tasks, in two tracks:

- **Game UI/UX**: menus and navigation, HUD, inventory and shops, dialogue, save and load,
  onboarding, feedback, input across keyboard, gamepad and touch, readability at pixel scale.
- **Web UX**: heuristics, WCAG 2.2, forms and errors, empty and loading states, focus and
  dialogs.

Three outputs: `catalog.md` (each game UI element: when to use, when not, the Blip component
that covers it or "gap"), `candidates/<topic>.blip-rules.yaml` (rules in sidecar format, each
with a `source`), `conflicts.md` (where game and web conventions disagree). Nothing in it is a
rule until I move it into a sidecar. The catalog and what agents invent on day zero decide which
components get built; some gaps stay open so gap drafts have something to fire on.

## 5. Order

Tasks and research first. Then a day-zero run on today's Blip with `search` and `docs` only,
as soon as runs can be made and counted; the rendered layer, the judge and `validate` are added
to it later by collecting again. Then rules, examples, `validate`, and the plugin's pieces, each followed by the configuration
that measures it. The rendered pass in the reviewer comes right after v1. `tasks/` has the
list. Every change to Blip is its own pull request and is checked a second time by a subagent
with fresh context before it is merged.

## 6. Out of scope

An MCP server, telemetry to any server, filing gaps automatically, rules for building Blip,
blocking commits or CI.
