# Blip UI harness: tasks

26 issue drafts, in dependency order. Each is one pull request. Names in backticks are handles
for the dependencies in this file, not ticket numbers. `spec.md` has the design each task builds;
**Q** numbers point into `open-questions.md`.

**For every task that changes `packages/blip-ui`** (code, pages, stories, tests, build): before
it is merged, a subagent with fresh context reviews the pull request against `AGENTS.md` and
`building-components.mdx`, and its findings and their answers are in the pull request. This is
an acceptance criterion of each such task even where the task does not repeat it.

## Order

Tasks in one row can run in parallel. A row starts when the rows it depends on are merged.

| Step | Tasks                                                                               | Needs                    |
| ---- | ----------------------------------------------------------------------------------- | ------------------------ |
| A    | `eval-tasks`, `research-game-ui`, `research-web-ux`, `pack-build`, `readable-types` | nothing                  |
| B    | `template`, `cli-lookup`                                                            | A                        |
| C    | `eval-run`, `eval-collect`                                                          | B                        |
| D    | `day-zero`                                                                          | C                        |
| E    | `eval-rendered`, `eval-judge`                                                       | D                        |
| F    | `rule-format`, `manifest-props`, `examples-and-patterns`                            | `cli-lookup`             |
| G    | `rule-extraction-menus`, `rule-extraction-display`, `patterns`, `validate`          | F; `patterns` also D     |
| H    | `validate-compiler`, `plan-skill`                                                   | G                        |
| I    | `edit-hook`                                                                         | `validate`, `plan-skill` |
| J    | `reviewer`                                                                          | `validate-compiler`, I   |
| K    | `gap-drafts`                                                                        | J                        |
| L    | `sweep`                                                                             | D, E, K, `patterns`      |
| M    | `reviewer-rendered` (right after v1)                                                | L                        |

Steps A to D get the day-zero run going with the deterministic layer only. Its run directories
stay in the cache, and every later layer is added by collecting day zero again, without
rerunning an agent: the rendered layer and the judge in step E, `validate`'s measure 2 in step G.
Results are compared only when the same collector and CLI version produced them (`eval-collect`).
`readable-types` changes Blip itself and lands before day zero, so the baseline already has
readable types. Step F touches only Blip and the CLI, so it can be worked on while C to E run,
but nothing from F to K is packed into a tarball that day zero uses.
The components day zero calls for are drafted by `day-zero` and are not in this list.

---

## Step A

### `eval-tasks`: Write the eval's tasks and their rubrics

**Problem.** Everything the eval measures depends on what agents are asked to build, and the
template's data has to fit those tickets. The tasks come first.

**Outcome.** Six tasks in `evals/blip/tasks/<id>/`: `shop`, `saves`, `pause`, `fight-hud`,
`quests`, `camp-rest` (spec 3.2), each a `task.md` written like a ticket and a `rubric.json`.

**Included.** The ticket text. 3 to 6 rubric statements per task, at least one marked
`unstated` (empty inventory, not enough gold, a full slot). The URLs to screenshot per task
(`?screen=…&state=…`). A list of what `src/game/data.ts` must hold for the six tickets.
`evals/blip/README.md` with the two file formats.

**Not included.** The template, any code, anything taken from Pushback.

**Acceptance criteria.**

- No ticket names a Blip component, a rule or the CLI
- Every rubric statement can be answered yes or no from the diff or from one named screenshot
- Every unstated requirement is reachable through a fixture named in the task's URLs
- `camp-rest` changes a screen that already exists and says so
- I have read all six and would accept them as tickets

**Depends on.** Nothing.

**Changes in the eval.** Defines the tasks and the rubric layer's statements.

### `research-game-ui`: Catalog game UI elements and draft rules from game UX sources

**Problem.** Blip's pages describe the components Pushback needed. Which elements a small game
needs beyond those, and what the rules for them are, is not written down anywhere.

**Outcome.** In `packages/blip-ui/research/`: `catalog.md`, `candidates/*.blip-rules.yaml`,
and the game half of `conflicts.md`.

**Included.** Menus and navigation, HUD, inventory and shops, dialogue, save and load,
onboarding, feedback, input across keyboard, gamepad and touch, readability at pixel scale. Per
catalog entry: when to use, when not, the Blip component that covers it or "gap". Candidate
rules in the sidecar format (spec 2.2), each with a `source` link.

**Not included.** Moving any candidate into a sidecar. Building components. The tarball
(`research/` is not in `files`).

**Acceptance criteria.**

- Every catalog entry names a Blip page or says "gap"
- Every candidate rule has an id by kind, one requirement, and a `source` that opens
- A candidate that no tool could check is marked `[review]`, an unsettled one `[open]`
- The entries the six eval tasks touch are all present

**Depends on.** Nothing. Reads `eval-tasks` if it is there.

**Changes in the eval.** None directly. With day zero's results it decides which components
get built and which gaps stay open.

### `research-web-ux`: Draft rules from web UX and accessibility sources, and list the conflicts

**Problem.** Blip's accessibility sections say what each component does, not what a screen
built from them has to get right: errors, empty states, focus, dialogs.

**Outcome.** `candidates/*.blip-rules.yaml` for the web track and `conflicts.md` completed.

**Included.** Usability heuristics, WCAG 2.2, forms and errors, empty and loading states,
focus and dialogs. Conflicts between game and web conventions, each with both sources (for
example: a menu that wraps against a list that stops; a disabled item that stays reachable,
which `picker.mdx:57` already chose).

**Not included.** As `research-game-ui`.

**Acceptance criteria.**

- Every candidate has a `source`; WCAG candidates name the success criterion
- `conflicts.md` states for each conflict what Blip does today, with `path:line`, or "undecided"
- No candidate restates how a Blip component is built

**Depends on.** Nothing.

**Changes in the eval.** None directly. Feeds the rubric's unstated requirements in later task
sets.

### `pack-build`: Pack Blip into a tarball that holds only what a consumer gets

**Problem.** `pnpm pack` works today but ships everything: `src`, stories, tests and 154
baseline screenshots, 1.2 MB, with `exports` pointing at TypeScript source. An agent in an eval
run would read Blip's source and stories, which no real consumer has.

**Outcome.** `pnpm --filter @sebald/blip-ui pack` produces a tarball with `dist/` (`.js`,
`.d.ts`, `styles.css`, `tokens.css`), `README.md` and `package.json`. Inside the repo nothing
changes.

**Included.** `tsconfig.build.json` and a `prepack` script (spec 2.1). `files`. `publishConfig`
with `exports` on `dist/`. A short `README.md`: what Blip is, the import, the CSS line, that it
needs a bundler and Tailwind v4. `dist/` ignored by git, oxlint and oxfmt and excluded from the
root `tsc`.

**Not included.** `docs/`, the CLI, `bin` (`cli-lookup`). Compiling the CSS (**Q4**). A
published package.

**Acceptance criteria.**

- The tarball lists no `.mdx`, `.stories.`, `.test.`, `.png` and no `src/`
- A new Vite, React and Tailwind v4 app outside the repo installs the tarball, type-checks, and
  shows a `Stage` with a `Window` and a `Button`, styled
- `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm test:game` pass unchanged
- The pull request states the tarball's size and file count

**Depends on.** Nothing.

**Changes in the eval.** Makes the fixed Blip version a file: every run installs a tarball,
and its hash goes into `results.json`.

### `readable-types`: Say each prop's options in its type

**Problem.** Six components type their options through cva (`variant?:
NonNullable<Variants['variant']>`, `button.tsx:17`), and `IconButton`'s `icon` is
`keyof typeof ICONS`. The emitted `.d.ts`, an editor's hover and a type error show those
expressions, not the values. Stories repeat the values by hand (`button.stories.tsx:15-18`).

**Outcome.** Every prop that picks from options is a literal union in the component's props
interface, the cva variants are checked against it with `satisfies`, and `IconName` is an
exported union of the icon names (**Q5**).

**Included.** The eight prop sites in six components, their `*.styles.ts`, `icons.ts`. A line
in `building-components.mdx` (Props) stating the convention. A unit test that fails if a
story's `options` differ from the union, or the stories read the values from one exported
constant.

**Not included.** New variants, renamed values, any change in what renders. The manifest
(`manifest-props`).

**Acceptance criteria.**

- `grep -r "VariantProps\|Variants\['" packages/blip-ui/src/components` finds nothing in a
  props interface
- Emitting declarations shows each union written out (checked in the pull request for
  `Button`, `Dialog`, `Meter`)
- Removing a key from a cva variant, or adding one, fails `pnpm --filter @sebald/blip-ui
  typecheck`
- No screenshot changes: the "Blip UI Visual Regression" workflow passes without new
  baselines; `pnpm test:game` passes
- A subagent with fresh context has reviewed the pull request (the rule at the top), and the
  pull request lists what it found and what was done about each

**Depends on.** Nothing.

**Changes in the eval.** What an agent reading `dist` finds. Measured on day zero: reads of
`.d.ts` files, values passed that a prop does not take.

---

## Step B

### `template`: Build the consumer app the eval's agents work in

**Problem.** Agents need a project that looks like a real one: its own data, its own theme, a
screen that predates the design system. It must not be Pushback.

**Outcome.** `evals/blip/template/` as in spec 3.1, building against the tarball.

**Included.** Vite, React, Tailwind v4, TypeScript. `src/game/data.ts` with what `eval-tasks`
listed, and the fixtures. `state.ts`. `theme.css` with its own `--bui-*` values. `app.tsx`
with the `Stage` and the `?screen=&state=` switch. `screens/camp.tsx`, built without Blip. The
exclusions from the root `tsc`, oxlint and oxfmt (the root `tsc` includes `**/*.tsx`).

**Not included.** Any of the six screens the tasks ask for. A router. `CLAUDE.md` (written by
`eval-run`).

**Acceptance criteria.**

- With the tarball installed: `pnpm typecheck` and `pnpm build` pass
- `?screen=camp` renders wide and on a 402 px phone; `?screen=camp&state=broke` shows the
  fixture's gold
- `camp.tsx` imports nothing from `@sebald/blip-ui` and styles itself inline
- The theme is visibly not Blip's default palette
- Nothing in the template names Pushback or this repo
- `pnpm lint`, `pnpm format:check` and `pnpm typecheck` at the root ignore the template

**Depends on.** `eval-tasks`, `pack-build`.

**Changes in the eval.** Is the starting point of every run.

### `cli-lookup`: Ship a `blip` command that searches and prints the docs

**Problem.** Blip's docs are Storybook pages. A consumer's agent has no Storybook, and the
MDX sources are full of Storybook blocks. Day zero needs the smallest CLI that could work.

**Outcome.** `blip`, `blip search` and `blip docs` (spec 2.4), reading `docs/` from the
installed package, and the pack step that writes `docs/pages/*.md` and a first
`manifest.json`.

**Included.** `cli/` with `bin.ts`, the three commands, `cli/build/` for pages and the manifest
(pages, summaries, exports from `src/index.ts`; no props yet). `bin` in `publishConfig`,
`docs/` in `files`. A `lookup` line in `.blip/events.jsonl` per call, and none at all when
`BLIP_EVENTS=off` is set (the collector's own calls, spec 2.4). `cli/**` in the
package's `tsconfig.json` and in the root `test:lib` glob. One line about `pnpm exec blip` in the
package's `README.md`.

**Not included.** Rules, examples, props tables, `validate`, hooks, `init`.

**Acceptance criteria.**

- From a tarball install: `pnpm exec blip docs dialog` prints markdown with no `import`, `<Meta`,
  `<Canvas` or `<Controls`
- 23 pages: the 21 components, `introduction`, `hooks`. `building-components` is not shipped
- `blip search confirm before deleting` puts `confirm` first; `blip search` with no match
  says so and exits 0
- `blip docs nope` exits 2 and names the closest page
- With `BLIP_EVENTS=off`, no command creates or appends to `.blip/events.jsonl`
- Each command answers in under 300 ms
- The build lists exports that are on no page (today at least `Stage.Center`)
- Unit tests for the conversion and the ranking run in `pnpm test`

**Depends on.** `pack-build`.

**Changes in the eval.** Enables the `cli` configuration. New metrics: `blip` calls by command,
and lookups before the first `.tsx` write.

---

## Step C

### `eval-run`: Run a task in an isolated copy of the template with headless Claude Code

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

**Depends on.** `template`, `cli-lookup`.

**Changes in the eval.** Creates the runs. Configurations `no-cli` and `cli`.

### `eval-collect`: Turn a label's runs into `results.json` and `summary.md`

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

**Depends on.** `template`. Developed against the run layout of spec 3.3; needs `eval-run` to
be tried on a real run.

**Changes in the eval.** The deterministic layer: measures 1, 5, 6 and 7 of spec 3.6.

---

## Step D

### `day-zero`: Run the eval on today's Blip and decide what to build

**Problem.** Without a baseline, no later number means anything, and which components Blip is
missing is a guess.

**Outcome.** `evals/blip/results/<date>-day-zero/` for `no-cli` and `cli`, six tasks, three
repetitions each, on one tarball of today's Blip, collected with the deterministic layer. The
run directories stay in `~/.cache/blip-eval/` until the sweep: `eval-rendered`, `eval-judge`
and `validate` collect day zero again from them. A section in `summary.md`, written after
reading the runs, on what agents invented: raw elements, components of their own, Blip
components used for the wrong thing. `docs/blip-harness/components.md`: issue drafts for the
components to build, and the gaps left open on purpose.

**Included.** A pilot of three runs first, to set the budget per run and the wall-clock limit
from what they cost (**Q13**). Reading every failed run and a sample of the passing ones. The
spread between repetitions per measure, which later comparisons are held against.

**Not included.** Building the components. Any harness piece. The rendered layer, the judge and
`validate`'s measure 2, which are added by collecting again.

**Acceptance criteria.**

- 36 runs collected; runs that hit the budget or the time limit are reported, not dropped
- Every invented element in the write-up is tied to a run and a line
- Each catalog "gap" the tasks touch is either drafted as a component or listed as left open
- The estimates in **Q13** are replaced by measured numbers

**Depends on.** `eval-run`, `eval-collect`, `research-game-ui` (the catalog), `readable-types`.

**Changes in the eval.** The baseline, first for measures 1, 5, 6 and 7, then for the rest as
the layers land, and the spread that defines "a piece helps".

---

## Step E

### `eval-rendered`: Open each result in a browser and check layout and accessibility

**Problem.** Code that builds can still put a window half outside the stage or cut a price off.
Blip already has the check for that, but it is tied to Storybook.

**Outcome.** `collect.mjs` builds and serves each result, opens the rubric's URLs wide
(960 × 600) and on a phone (402 × 714), and records layout escapes, cut text and axe
violations. Screenshots are kept in the cache.

**Included.** A root parameter for `escapes()` in `tests/visual/layout.ts` (it reads
`#storybook-root` at `:15`; the default stays, so `stories.spec.ts` is unchanged). `axe-core`
as a root dev dependency (today it is only there through Storybook's addon). The Playwright
script, using the installed Chrome as the game's tests do.

**Not included.** Baselines or comparisons. The rendered pass in the reviewer
(`reviewer-rendered`).

**Acceptance criteria.**

- On the untouched template, `camp` yields the same result on two runs
- A fixture screen with text in a too-small box that hides its overflow yields one "cut" entry
- A screen that fails to render is recorded as such and does not stop the collection
- The "Blip UI Visual Regression" workflow passes on the pull request
- Day zero is collected again from the cache, and its results now hold measure 4

**Depends on.** `eval-collect`, `day-zero` (its runs to collect again).

**Changes in the eval.** The rendered layer: measure 4.

### `eval-judge`: Score each run against its rubric with an LLM judge

**Problem.** Whether the shop shows what the player can't afford is not something a parser or
a layout check can answer.

**Outcome.** `collect.mjs` asks a judge each rubric statement and stores pass or fail with the
evidence.

**Included.** `evals/blip/judge.md`, the judge's prompt. The judge sees the task, the rubric,
the diff of `src/` and the screenshots, and nothing that names the configuration. JSON answers
checked against a schema; an invalid answer is retried once, then recorded as a judge error.
The judge's model and cost in `results.json` (**Q14**).

**Not included.** Judging style or taste. Comparing screenshots to each other.

**Acceptance criteria.**

- On six day-zero runs I labelled by hand, one per task, the judge agrees with me on at least
  nine statements in ten; where it does not, the statement is rewritten in `eval-tasks`
- Day zero is collected again from the cache, and its results now hold measure 3
- The judge's input contains no `.blip/`, no `CLAUDE.md` and no configuration name
- Unstated statements are reported on their own
- `summary.md` lists every failed statement with the judge's evidence, for me to read

**Depends on.** `eval-collect`, `eval-rendered` (for the screenshots), `day-zero` (the runs to
label and to collect again).

**Changes in the eval.** The rubric layer: measure 3.

---

## Step F

### `rule-format`: Give rules a sidecar format, generate `rules.json`, render them on a page

**Problem.** Blip's consumer rules are "Do" and "Don't" bullets in prose (21 Usage sections).
They have no ids, so nothing can point at one, check one, or turn one off.

**Outcome.** The sidecar format of spec 2.2, the pack step that writes `docs/rules.json`, the
two MDX blocks, `blip rules`, `blip docs <rule-id>`, and the Dialog page converted as the
example.

**Included.** The loader and its five failures (spec 2.2). `.storybook/blocks/` with
`<Rules for>` and `<Rule id>`. `yaml` as a dev dependency. `dialog.blip-rules.yaml`, with
`dialog.mdx` rewritten so the prose explains and the block states. `rules[]` per page in the
manifest; rules in `search`.

**Not included.** The other pages. Any check: a rule may name a `check` that does not exist
yet, and the build only warns until `validate` lands.

**Acceptance criteria.**

- A unit test per build failure: duplicate id, id against kind or page, no check and no
  marker, and (as warnings for now) unknown check, unused check
- The Dialog page in Storybook shows its rules through the block, and no sentence in the page
  restates one
- `blip rules dialog` lists them; `blip docs C-DIALOG-1` prints the rule, the page's
  reasoning and the fix
- An `[open]` rule is in `rules.json` and absent from `blip rules`
- I have reviewed the Dialog sidecar

**Depends on.** `cli-lookup`.

**Changes in the eval.** None yet. Rule ids are what `validate` metrics are grouped by.

### `manifest-props`: Put every component's props, values and defaults into the docs

**Problem.** The tarball's `.d.ts` hides what a prop accepts: `variant?:
NonNullable<Variants['variant']>` (`button.tsx:17`). In Storybook the `<Controls>` block shows
the table; the markdown pages have nothing in its place.

**Outcome.** `manifest.json` carries `props[]` per export (name, type as text, `values`,
`default`, `required`, description), and every component page has a props table.

**Included.** `cli/build/props.ts`, the one module that asks the type checker (**Q5**), for
what `readable-types` cannot write out (inherited HTML attributes). The build fails on a public
prop whose resolved type still holds an indexed access or a `typeof`.
Descriptions and `@default` from the JSDoc that is already there (`dialog.tsx:24-48`).
`htmlProps` for components that pass native attributes on. The table in place of `<Controls>`.
`blip docs <page> --section props`.

**Not included.** Checking props (`validate`). Changing any component.

**Acceptance criteria.**

- `Button`: `variant` with `primary`, `secondary`, `destructive`, default `primary`
- `Dialog`: `role` with `dialog`, `alertdialog`; `IconButton`: `aria-label` required
- A snapshot test over four components fails when a prop changes
- A prop without a description is listed by the build

**Depends on.** `cli-lookup`.

**Changes in the eval.** Enables the "invented props" metric to be exact. Docs get longer:
watch tokens per `blip docs` call.

### `examples-and-patterns`: Move examples into files that stories and the CLI both read

**Problem.** The only complete examples of Blip in use are stories, which the tarball does not
ship, and the two full screens (`compositions/together.stories.tsx`) have no page at all. The
plan step needs a pattern and an example to look up.

**Outcome.** Example files under `components/<name>/examples/`, imported by the stories and
copied to `docs/examples/`. Two pattern pages, `patterns/menu-screen.mdx` and
`patterns/duel.mdx`, from the existing compositions. `blip examples`.

**Included.** At least one example per component page, taken from its composition stories
(`Default` and `Overview` stay stories). `<Canvas>` of an example story becomes its source in
the markdown page. Imports rewritten to `@sebald/blip-ui` on the way into `docs/`. Pattern
pages with when to use, the parts, and the example. `examples[]` in the manifest and in
`search`.

**Not included.** New patterns (`patterns`). Rules for the pattern pages beyond what the
compositions already show.

**Acceptance criteria.**

- Every file in `docs/examples/` type-checks against `dist/` as consumer code
- No example imports from a story, and no story duplicates an example's JSX
- Story ids are unchanged and the "Blip UI Visual Regression" workflow passes without new
  baselines
- `blip examples dialog` lists, `blip examples dialog/options` prints the source
- `blip search menu` returns the pattern page first

**Depends on.** `cli-lookup`.

**Changes in the eval.** What the plan step can find. Metric: which examples were opened.

---

## Step G

### `rule-extraction-menus`: Extract the consumer rules of the menu and container pages

**Problem.** After `rule-format` only Dialog has rules. The others still mix rules, reasons and
descriptions of how the component is built.

**Outcome.** Sidecars for `button`, `icon-button`, `controls`, `picker`, `setting`, `confirm`,
`tabs`, `window` and `parts`, and their pages rewritten around the blocks.

**Included.** Rules from the Usage, Input and Accessibility sections. Each rule atomic, with a
`check` name or a marker, and a `fix` where it names a check. "When not to use" notes from
the pages' opening paragraphs (`button.mdx:9-11`: lists of choices are a Picker). One commit
per page, so I can review page by page.

**Not included.** Statements about how Blip builds the component ("a native `<button>`"): they
stay prose. New rules from the research. Implementing checks.

**Acceptance criteria.**

- Every "Do" and "Don't" bullet of the nine pages is a rule with an id or stays as prose with
  its reason, and the pull request lists which
- No rule holds two requirements joined by "and"
- No page restates a rule outside its block
- I have reviewed each page

**Depends on.** `rule-format`.

**Changes in the eval.** None until `validate`; then these ids appear in the metrics.

### `rule-extraction-display`: Extract the consumer rules of the display pages and the foundations

**Problem.** As `rule-extraction-menus`, for the other half, plus the principles in
`introduction.mdx`, which are rules a consumer's own classes have to follow too.

**Outcome.** Sidecars for `text`, `bitmap-text`, `line`, `typewriter`, `speech-bubble`,
`ledger`, `meter`, `timer`, `stamp`, `pixel-icon`, `stage`, `introduction` and `hooks`, and
`correctness.blip-rules.yaml` for the X rules.

**Included.** As `rule-extraction-menus`. The foundation rules (colours through `--bui-*`,
lengths in stage pixels, the spacing and text scales, motion, layers) as kind `F` (**Q9**):
`F-COLOUR-1`, `F-LENGTH-1`, `F-MOTION-1`, ….

**Not included.** As `rule-extraction-menus`.

**Acceptance criteria.** As `rule-extraction-menus`, and:

- Each foundation rule names the predicate that will check it
- The X rules cover: an import that is not an export, a prop a component does not have, a
  value outside a prop's values

**Depends on.** `rule-format`.

**Changes in the eval.** As `rule-extraction-menus`.

### `patterns`: Write pattern pages for the screens a small game needs

**Problem.** After `examples-and-patterns` Blip has two pattern pages, both of Pushback's
screens. The plan step looks up a pattern before it builds a screen, and for most screens a
small game needs (buying and selling, save slots, an options menu, a HUD) there is none.

**Outcome.** Three or four pages in `src/patterns/`, chosen from the research catalog and from
what day zero's agents built by hand, each with its sidecar, example and composition story.

**Included.** The choice of patterns with its reasons, in the pull request. Per page: when to
use, when not, the parts and which component each is, the states a ticket does not mention
(empty, not affordable, full), an example file, and `P` rules moved from the research
candidates you approve (each with its source). A composition story per pattern; its new
baselines are looked at before they are committed. Generating them with
`pnpm vrt:update:ci` starts a workflow: ask before running it (or use `pnpm vrt:blip-ui:update`
locally in Docker).

**Not included.** New components: a pattern built on a gap uses the closest fit and says so,
or waits for the component. A pattern for `quests` or `camp-rest`: those two tasks stay without
a matching pattern, so the sweep can compare (**Q12**).

**Acceptance criteria.**

- Every example type-checks against `dist/` as consumer code
- Every `P` rule has a `source` or a reason on the page
- Searching with words from a matching task's ticket (not the pattern's name) returns the
  pattern in the first three results; this is checked for each matched task
- `evals/blip/README.md` lists which task matches which pattern
- The layout check passes on the new stories, wide and on a phone

**Depends on.** `examples-and-patterns`, `rule-format`, `day-zero`, `research-game-ui`.

**Changes in the eval.** What the plan step can find. The sweep reports tasks with and without
a matching pattern apart.

### `validate`: Check a file against the rules and report findings an agent can act on

**Problem.** A rule that is only prose is followed when the agent happens to read it. Nothing
tells it what it got wrong, where, and what right looks like.

**Outcome.** `blip validate` (spec 2.4, 2.5), without the compiler pass.

**Included.** `oxc-parser`, pinned (**Q1**); checks written against its ESTree AST. A check for every `check` the sidecars name: structure,
correctness from the manifest, foundations. The spacing, text, opacity and layer predicates
move from `uniformity.test.ts` into `src/foundations/`, shared by the test and the CLI. The
finding format, text and JSON. `--changed-since` with element spans (**Q8**). Fingerprints.
`blip.config.json` with `rules.off`. Events `validate`, `finding`, `rules-off`,
`parse-failed`. The build now fails on an unknown or unused check. `collect.mjs` runs it on
every result with its own copy of the CLI.

**Not included.** `--compiler`. Hooks. Rendered checks.

**Acceptance criteria.**

- Per check, two fixture files: one with the fault and the expected finding, one clean
- A fixture repository: a fault inside an element with a changed line is reported, the same
  fault in an untouched element of that file is not
- A rule in `rules.off` yields no finding and one `rules-off` event
- A file with a syntax error yields no finding and exit 0
- `uniformity.test.ts` passes on the shared predicates
- Run over `packages/pushback/src/ui` as a reading exercise: the pull request lists every
  finding and says for each whether it is a real fault, a wrong rule or a wrong check
- A 200-line file is checked in under 300 ms
- Day zero is collected again from the cache with `validate`, and its results now hold
  measure 2; the collector's calls leave the runs' event logs unchanged (`BLIP_EVENTS=off`)

**Depends on.** `rule-format`, `manifest-props`. Better after both extraction tasks; checks
for rules extracted later are added with them.

**Changes in the eval.** Measure 2 for every configuration, `no-cli` included: `validate`
errors and warnings by rule, invented exports and props, colours, lengths and motion; the
split of raw tags and classes (**Q11**).

---

## Step H

### `validate-compiler`: Add a compiler pass that turns type errors on Blip into findings

**Problem.** The fast pass sees literal props only. A value built at run time, a wrong
callback, a child of the wrong type are `tsc` errors, long and unreadable for the purpose.

**Outcome.** `blip validate --compiler`: runs the project's own `tsc`, maps its diagnostics on
Blip imports and props to the X rules, and adds the allowed values from the manifest.

**Included.** Running `tsc --noEmit --pretty false` from the project, parsing its lines,
filtering to the files asked for. The mapping to X ids. Other errors passed through without
an id. A clear message when the project has no `typescript`.

**Not included.** TypeScript's API. A watch mode or cache.

**Acceptance criteria.**

- Fixtures: a wrong `variant` from a variable, a missing required `aria-label`, an unknown
  export; each yields its X finding with the allowed values or the closest name
- An error outside Blip is reported once, unchanged
- Without `typescript` installed the command exits 2 and says what is missing
- The time of the pass on the template is in the pull request

**Depends on.** `validate`.

**Changes in the eval.** `collect.mjs` uses `--compiler`. Used by the reviewer.

### `plan-skill`: Ship the agent plugin with a plan skill, and `blip init`

**Problem.** In the `cli` configuration the agent is told the command exists and nothing else.
Whether it looks anything up before writing is up to it.

**Outcome.** `plugin/` in the tarball with `.claude-plugin/plugin.json` and `skills/plan/`.
`blip init`. The `plan` configuration in `run.mjs`.

**Included.** The skill's text (spec 2.6): search, pattern, components, example, then code.
`blip init`: the plugin in `.claude/settings.json` if a trusted project loads it from
`node_modules`, else the fallback (**Q6**); `blip.config.json`; `.blip/` in `.gitignore`.
`--plugin-dir` in `run.mjs`. `plugin/` in `files`.

**Not included.** Hooks, the reviewer, gap drafts.

**Acceptance criteria.**

- A `plan` run's `init` event lists the plugin and its skill, and nothing else new
- The outcome of the test in **Q6** is written into `open-questions.md`, and `blip init`
  does what that outcome allows
- `blip init` run twice changes nothing the second time and keeps existing settings
- The skill's text names commands and no rule

**Depends on.** `cli-lookup`, `examples-and-patterns`, `rule-format`, `eval-run`.

**Changes in the eval.** Configuration `plan`. Metric: share of runs where a `search`, `docs`
or `examples` call comes before the first `.tsx` write, and whether the skill was invoked.

---

## Step I

### `edit-hook`: Check every edit of a `.tsx` file and send back findings on the changed lines

**Problem.** Faults are cheapest to fix right after they are written. Without a check per
edit they pile up until the end, or stay.

**Outcome.** `blip hook post-edit` and the `PostToolUse` entry in `plugin/hooks/hooks.json`.
The `hook` configuration.

**Included.** Reading the hook's JSON, running the fast pass on the file, the changed-lines
filter, attempts per fingerprint from the event log, the reply (at most 5 findings, under the
10,000 character limit), a finding dropped from replies after two attempts, events `hook`
(with milliseconds) and `fixed`. Silence for files that are not `.tsx` or are in
`node_modules`. A timeout on the hook entry.

**Not included.** The compiler pass. Blocking an edit. The Stop hook.

**Acceptance criteria.**

- With a recorded hook input on stdin, the reply is valid JSON with the expected findings
- In the messy screen, an edit of one line reports nothing about untouched lines
- The same finding is sent twice at most
- On the template, the hook's time is under 2 s at the 95th percentile over a run
- A hook that crashes exits 0 with no output and logs the error
- A `hook` run's stream shows the hook event for every Write and Edit of a `.tsx` file

**Depends on.** `validate`, `plan-skill` (the plugin folder).

**Changes in the eval.** Configuration `hook`. Metrics: edits the hook ran on, its time,
findings sent, findings fixed in the turn, attempts per finding.

---

## Step J

### `reviewer`: Review a UI turn at its end and report at most five items

**Problem.** The hook sees one file's changed lines and only what a parser can check. Component
choice, composition, content, accessibility in context, and type errors need a second look.

**Outcome.** `blip review`, `blip hook stop`, `plugin/agents/reviewer.md`, the `Stop` entry in
`hooks.json`. The `reviewer` configuration.

**Included.** The packet of `blip review` (spec 2.4). `blip hook stop`: holds a stop once when
`.tsx` files changed and no review ran since, never more than twice a turn, never with
`reviewer: false`. The agent's text: run the packet, judge the `[review]` rules, fix, run it
once more, return at most 5 items as fixed, needs a decision, gaps; a finding with two
attempts goes to "needs a decision" untouched. Event `review` with the items.

**Not included.** The rendered pass. Filing anything. A reviewer for non-UI turns.

**Acceptance criteria.**

- A turn that changed no `.tsx` file ends without a review
- A turn that did ends with a message holding the three groups and at most 5 items
- With `reviewer: false` the stop is never held
- A turn cannot be held more than twice (test with a hook input where `stop_hook_active` is
  set)
- The reviewer's tokens can be read from the transcript and are in `results.json`
- A planted `[review]` fault (a column of buttons for a list of choices) is named in a run

**Depends on.** `validate-compiler`, `edit-hook`.

**Changes in the eval.** Configuration `reviewer`. Metrics: the reviewer's tokens and share of
the cost, items by group, "needs a decision" items, findings left after the turn.

---

## Step K

### `gap-drafts`: Draft a note when Blip has nothing that fits

**Problem.** When the design system lacks something, an agent invents it quietly. The
design system's owner never hears what was missing.

**Outcome.** `blip gap new`, the wording in the plan skill and the reviewer that leads to it,
and the `full` configuration.

**Included.** The command and the file format: what was needed, what was used instead, file
and line. Event `gap`. The reviewer's "gaps" group listing the drafts. The instruction to use
the closest fit, draft, and end the turn.

**Not included.** Filing an issue. Deciding whether a gap is real.

**Acceptance criteria.**

- `blip gap new …` writes one file and prints its path; the same gap twice updates it
- In a `full` run on a task that touches a gap left open on purpose, a draft names it
- In a run on a task with no gap, no draft is written
- `summary.md` lists every draft for me to mark as real or not

**Depends on.** `reviewer`. Needs at least one gap left open by `day-zero`.

**Changes in the eval.** Configuration `full`. Metrics: drafts per run, share that name a real
gap (marked by hand), components invented without a draft.

---

## Step L

### `sweep`: Run all six configurations on one Blip version and write up what each piece does

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

**Depends on.** `day-zero`, `eval-rendered`, `eval-judge`, `gap-drafts`, `patterns`.

**Changes in the eval.** The first full result. Input for the writing.

---

## Step M, right after v1

### `reviewer-rendered`: Let the reviewer look at the rendered screen

**Problem.** The reviewer reads code. A window outside the stage or a cut-off price it can only
guess at, though the eval already measures both.

**Outcome.** `blip review --rendered` opens the changed screens wide and narrow, runs the
layout check, and adds what it finds to the packet.

**Included.** Moving `escapes()` to where both Blip's tests and the CLI can use it. A way for
a project to say how a screen is opened (`blip.config.json`). Playwright as an optional peer.
A new configuration after `full`.

**Not included.** Screenshots as baselines. axe in the reviewer (a follow-up if this pays).

**Acceptance criteria.**

- A screen with text cut by its window yields a finding with the element and the pixels
- Without Playwright installed, the review runs as before and says the rendered pass was
  skipped
- The pass's time and the reviewer's added tokens are in `results.json`

**Depends on.** `sweep`.

**Changes in the eval.** A seventh configuration. Its effect is read on measure 4.
