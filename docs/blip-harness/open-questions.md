# Blip UI harness: open questions

What I could not settle from the code or the decisions, each with a recommendation. Q1 to Q7
are places where the code or the tooling contradicts a decision.

**Answered (review of 2026-11-13).** Q2 one tool list, Q4 ship the Tailwind source, Q6
`--plugin-dir` for the eval and a manual test for `blip init`: accepted as recommended. Q7: no
leak seen on your side either; the probe stays in `run.mjs` as a guard. Q1, Q3 and Q5 were
researched again and are rewritten below.

**Answered (second review, 2026-11-13).** Q5 accepted: Blip's source may change, each change in
its own pull request with a second check by a subagent with fresh context (now a rule for
every task that changes Blip, `tasks.md`). Q8, Q9, Q10, Q14, Q15, Q16 accepted as recommended.
Q11 accepted, plus a check that lists overrides that keep coming back as candidate variants or
sizes. Q12 accepted, plus pattern pages written on purpose (task `patterns`). Q13: everything
runs locally on the Claude Code subscription, no API key; `claude-sonnet-5-5` with the two ends
again on `claude-opus-5-5`; 3 repetitions for day zero, 5 for the sweep. **Nothing is open.**
What a decision still waits on is a measurement (the pilot, day zero), named in its task.

How each fact was checked is marked: **ran** (I ran it on this machine, 2026-11-13, Claude Code
2.1.323, Node 24.11, pnpm 11.28.6, TypeScript 7.0.2), **read** (in the repo, with `path:line`),
**docs** (Claude Code's documentation, read by a helper agent, not run), **guess**.

## Conflicts with a decision

### Q1. The CLI cannot use `typescript` for its AST checks (decision 2)

**Found.** The repo is on TypeScript 7.0.2 (`packages/blip-ui/package.json:45`). Its main
export has `version` and `versionMajorMinor` and nothing else (**ran**:
`import('typescript')`). There is no `createSourceFile`. The AST and the checker are behind
`typescript/unstable/*` and work by starting the native compiler as a child process. So "an
optional peer the CLI uses for its AST checks" would tie the per-edit hook to an API named
unstable, in whatever version the consumer has, and to a compiler process on every edit, which
the decision for the hook rules out ("without the compiler pass").

**Compared (ran).** Three parsers, each in a fresh Node process as the hook would start it,
over the 61 `.tsx` files of Blip's components and Pushback's UI (8,885 lines), second of two
runs (the first includes the disk cache):

| Parser                  | Version | Load  | All 61 files | Largest file (1,143 lines) | A file cut off mid-edit                    |
| ----------------------- | ------- | ----- | ------------ | -------------------------- | ------------------------------------------ |
| `@babel/parser`         | 8.1.2   | 8 ms  | 58 ms        | 3.6 ms                     | throws                                     |
| `@swc/core` `parseSync` | 1.16.22 | 26 ms | 26 ms        | 3.3 ms                     | throws                                     |
| `oxc-parser`            | 0.158.0 | 6 ms  | 5 ms         | 0.5 ms                     | returns what it could parse and the errors |

All three fit the hook's 2 s many times over. Babel is not out of date (8.1.2, published this
week), but it is the slowest and the only one in plain JavaScript, which no longer counts for
much: SWC and Oxc ship prebuilt binaries per platform as optional dependencies, and both
installed and ran without a build step.

tsgo as a parser: TypeScript 7 has no in-process parser. Its AST is reached through
`typescript/unstable/sync`, which starts the native compiler as a child process and talks to it
over a pipe (**ran**: a project load and one type query took 251 ms). That is the right tool
for questions about types and the wrong one for a per-edit syntax check: an unstable API, tied
to TypeScript 7 in the consumer's project, a process per edit.

**Recommendation.** **Oxc** (`oxc-parser`) for the fast pass, the project's `tsc` (tsgo when
the project is on 7) for the compiler pass.

- Fastest by a factor of five, and it recovers from a broken file, which matters for a hook
  that runs between two edits.
- Its AST is ESTree, the shape ESLint rules and typescript-eslint use. Checks written against
  it read like ESLint rules, which is the most widely known form for a lint rule and keeps the
  findings transferable. SWC's AST is its own, and its spans are byte offsets that keep growing
  across calls in one process, a known trap.
- The repo already lints with oxlint, from the same project. oxlint now runs JavaScript plugins
  with the ESLint rule API; whether Blip's checks could later ship as such a plugin is a
  follow-up, not part of v1.
- Risk: pre-1.0. Pinned exactly, as everything in this repo (`.npmrc`: `save-exact`).

`typescript` stays an optional peer, for the compiler pass only.

### Q2. The decided tool list cannot run the plan skill or the reviewer, and does not take the web away (decision 9)

**Found (docs).** `--allowedTools` only approves tools without asking; it does not remove any
from the model's list. `--tools` is the flag that restricts the list. The tool that invokes a
skill is `Skill` and the one that starts a subagent is `Agent`; with an explicit list that
omits them, a plugin's skill and agent cannot be used. With `--permission-mode acceptEdits`
under `-p`, a call that nothing approves is denied and the run goes on. And `Bash`, once
approved as a whole, can reach the network (`curl`, `pnpm add`), so "no web access" does not
follow from leaving out the web tools.

**Recommendation.**

- `--tools "Bash,Read,Write,Edit,Glob,Grep,Skill,Agent"` and the same list as
  `--allowedTools`, **identical in every configuration**. If `Agent` were added only for the
  `reviewer` configuration, that configuration would also gain Claude Code's built-in
  subagents (**ran**: `Explore`, `Plan`, `general-purpose` and three more are listed in the
  `init` event) and the comparison would measure two changes.
- Do not sandbox the network in v1. `collect.mjs` flags every run whose Bash commands reach
  out (`curl`, `wget`, `gh`, `npm view`, installing a package) and reports them apart. If day
  zero shows any, add deny rules for those commands.

### Q3. Which build tool for `dist/` (expected question)

**Found (ran).** The repo's `tsc` is TypeScript 7.0.2, which is tsgo, the native compiler in
Go: it is the fast one. It emits Blip's 63 source files, JavaScript and declarations, in 1.4 s;
declarations alone take 0.37 s. One file per source, `'use client'` kept, class strings
untouched. With `rewriteRelativeImportExtensions` it rewrites `.ts` imports to `.js`, and the
emitted file runs in Node.

Compared with Oxc, to use one tool for both (**ran**): `oxc-transform` 0.158.0 turns the same
63 files into JavaScript in 10 ms. It writes declarations only under `isolatedDeclarations`,
which needs every export's type written out, and Blip fails that with 159 errors in Oxc and 193
in tsgo, most of them in the `*.styles.ts` files (the cva objects are exported with inferred
types: `picker.styles.ts` 16, `tabs.styles.ts` 13, `button.styles.ts` 9). So Oxc could build the
JavaScript, and tsgo would still have to write the declarations. SWC writes no declarations at
all. tsdown (Rolldown and Oxc) bundles, which loses the per-file `'use client'`.

**Recommendation.** tsgo alone (`tsc` from `typescript` 7), no bundler, no new dependency. The
whole pack step stays under 2 s, so a second tool would add a moving part to save about one
second. If Q5's change makes the components' declarations explicit, `isolatedDeclarations`
comes within reach and Oxc can take over the JavaScript then; worth no more than a note today.
Two consequences to accept:

- Blip's own imports are extensionless (`src/index.ts:8`), so `dist/` resolves only under a
  bundler. That is true of the source today; the README says so.
- The CLI has to run in plain Node, so `cli/` and the `src/foundations` modules it imports
  write `.ts` extensions on relative imports.

A bundler (tsdown, Vite's library mode) would fix the first point and cost the per-file
`'use client'` and one more tool. Not worth it for an eval tarball.

### Q4. `dist/` cannot hold plain CSS without a second build (decision 3)

**Found (read).** `src/styles.css` is Tailwind v4 source: `@source './'` (`:6`),
`@custom-variant tall` (`:10`), `@utility bui-focus` (`:15`), `@theme` with the keyframes
(`:83`). The components' styles are Tailwind classes in cva strings
(`button.styles.ts:22-75`). The site compiles all of it with its own Tailwind
(`src/css/styles.css:8`), and so does Storybook (`.storybook/main.ts:11`).

**Recommendation.** Ship the stylesheet as it is, next to the emitted `.js`, so `@source './'`
scans `dist/`. A consumer needs Tailwind v4, which is what a real consumer of Blip needs today,
and the template uses it. Screens also need it for the `tall:` variant and for placing things
in stage pixels (`together.stories.tsx:94`). A precompiled `styles.css` for consumers without
Tailwind is a later experiment, not part of v1.

### Q5. The emitted `.d.ts` does not show what a prop accepts (decision 3, "what a real consumer sees")

**Found (ran).** `dist/components/button/button.d.ts` reads
`variant?: NonNullable<Variants['variant']>`, with `Variants = VariantProps<typeof button.root>`.
The three values are two files and cva's types away. An agent that reads `dist` to learn the
API, which the eval counts, gets very little. Stories repeat the values by hand for the same
reason (`button.stories.tsx:15-18`).

**Found (ran).** Six components derive their props from cva this way, at eight places
(`grep VariantProps`, `Variants['`). `IconButton`'s `icon` is `IconName`, `keyof typeof ICONS`,
with the same problem.

**Recommendation.** Two changes, one in Blip's source and one in the build. Each helps a
different reader.

1. **Write the values into the source** (a change to Blip, so it needs your yes). Props
   declare their options as literal unions, and the cva config is checked against them:

   ```ts
   // button.tsx
   variant?: 'primary' | 'secondary' | 'destructive';

   // button.styles.ts
   variant: { primary: […], secondary: […], destructive: […] }
     satisfies Record<NonNullable<ButtonProps['variant']>, ClassValue>,
   ```

   The emitted `.d.ts` then reads `variant?: 'primary' | 'secondary' | 'destructive'`, which
   is what an agent reading `dist`, an editor's hover and a type error all show. A missing or
   extra key fails the type check, so the two cannot drift. `IconName` becomes an exported
   union of the icon names the same way. It is a plain, well-known practice, so it is also a
   finding for the write-up ("say a prop's values in its type"), and it removes most of the
   `isolatedDeclarations` errors from Q3. Cost: eight prop sites, six styles files, a line in
   `building-components.mdx` (Props), and the values written twice in a component's own
   folder. A new task, `readable-types`, before `pack-build`.

2. **Resolve the rest in the build.** The pack step still asks the checker for every prop
   (through `typescript/unstable/sync`, which returned `"destructive" | "primary" |
   "secondary"` in 251 ms) and writes the values, default and description into `manifest.json`
   and the pages' props tables. This catches what the source cannot write out: inherited HTML
   attributes, unions from elsewhere. The API is unstable, but it runs only at pack time, in
   this repo, on a pinned version, behind one module with a snapshot test, so a break shows on
   a version bump. The build also fails on a public prop whose resolved type still contains an
   indexed access or a `typeof`, so an unreadable type cannot come back.

A third option I set aside: rewriting the emitted `.d.ts` with the checker's resolved types. It
would fix the files without touching the source, but it is a build that edits its own output,
and the source an agent in this repo reads would still be unreadable.

Day zero measures whether this matters: how often agents read `.d.ts` files, and how often they
pass a value a prop does not take. If 1 is accepted, day zero runs on the readable types.

**Answer.** Both accepted. Change 1 is its own pull request (`readable-types`), checked a second
time by a subagent with fresh context before merge.

### Q6. A plugin inside `node_modules` loads from project settings only in a trusted folder (decision 5)

**Found (docs).** Project settings can enable a plugin from a directory:
`extraKnownMarketplaces` with a `directory` source plus `enabledPlugins`, and the directory
then needs `.claude-plugin/marketplace.json` beside `plugin.json` (it can list itself with
`"source": "."`). Local directory sources are read in place, not cached, so the plugin cannot
go stale against `node_modules`. Two limits:

- Marketplaces named by a repository's settings are ignored, silently, until the folder is
  trusted. Under `-p` in a never-trusted folder they are not used at all.
- The documented examples use absolute paths. Whether `./node_modules/…` is accepted is not
  documented, and an absolute path cannot be committed.

`--plugin-dir` has neither limit: it is repeatable, works with `-p`, needs no marketplace file
and no trust step, and loads hooks, skills and agents (**ran**: the flag exists; loading a
plugin with it is not tried yet, there is none).

**Recommendation.** The eval uses `--plugin-dir`, as decided. For `blip init`, the first step
of `plan-skill` is one manual test: a relative directory source in a trusted scratch project.
If the skill shows up, `blip init` writes those settings and the plugin ships a
`marketplace.json`. If not, `blip init` writes the fallback the decision names: the two hook
entries in `.claude/settings.json` and two pointer files (a skill and an agent in `.claude/`)
that say "call the CLI". Either way the outcome is recorded here.

### Q7. The global `~/.claude/CLAUDE.md` did not load with `--setting-sources project` (decision 9, "known leak")

**Found (ran).** Two one-line headless runs in an empty directory, same prompt ("is there a
section titled 'Personal preferences' in your context"), `--tools ""`, the small model:

| Flags                       | Answer                            | `init` event lists                                      |
| --------------------------- | --------------------------------- | ------------------------------------------------------- |
| `--setting-sources project` | `LEAK:no`                         | built-in plugins, 19 built-in skills, 6 built-in agents |
| none                        | `LEAK:yes # Personal preferences` | the user's plugins, skills and agents as well           |

So on 2.1.323 the flag keeps the global memory file, user plugins, user skills and user agents
out. One run per arm is thin, but the second arm shows the probe can see the leak when it is
there. The docs agree, and add that auto memory is separate and still loads.

**Recommendation.**

- Keep `--setting-sources project`. Add `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.
- `run.mjs` runs this probe once per label and stops if it answers yes, and checks every
  run's `init` event against the expected plugins, skills and agents. A Claude Code update
  that brings the leak back then fails loudly instead of skewing a result.
- Not `--bare`: it also skips hooks, including a `--plugin-dir` plugin's (**docs**).
- Not `CLAUDE_CONFIG_DIR` on an empty directory unless the probe fails: it works, but the
  login is stored under that directory, so every run would need an API key or a token from
  `claude setup-token` (**docs**).

If you saw the leak on an earlier version or under other flags, tell me which, and the probe
gets that case too.

## Questions the decisions leave open

Q8, Q9, Q10, Q14, Q15 and Q16 are accepted as recommended; Q11 and Q12 carry their answer below
the recommendation.

### Q8. How `validate` knows which lines changed, and which element a finding belongs to

Two parts.

**Changed lines.** The hook's input carries `tool_input` (`file_path`; for Edit `old_string`,
`new_string`, `replace_all`; for Write `content`). Whether Edit's `tool_response` has a patch
with line numbers is not documented (**docs**). Recommendation: do not depend on the payload.
Changed lines are the hunks of `git diff -U0 -w HEAD -- <file>`; an untracked file is all
changed; without git, everything is. It is one process of a few milliseconds, it works the
same for any agent, and it is cumulative, so a fault from an earlier edit in the turn stays
reported until it is fixed. The eval's run directories start with one commit, so "changed"
means "changed in this run", which is what `camp-rest` tests. `-w` keeps a formatter's
whitespace from marking a file as changed.

**Element spans.** The parser gives every JSX element its start and end line. Each check
anchors its finding to one element: the `<Dialog>` without a title, the second primary
`<Button>`, the import line. A finding is kept when a changed line lies inside its anchor's
lines. That is "on changed lines or on elements enclosing them" in one rule, and it means an
untouched sibling's fault is never reported.

Known cost: a moved block counts as changed. Accepted.

### Q9. Which kind do the foundation rules get?

Colours through `--bui-*`, lengths in stage pixels, the spacing and text scales, motion and
layers are consumer rules with guidelines (`introduction.mdx:12-29`,
`building-components.mdx:141-164`). They are not about one component (C), not a pattern (P),
and X is for checks with no guideline. Decision 13 already reports them as their own group.

**Recommendation.** A sixth kind, `F` (foundations): `F-COLOUR-1`, `F-LENGTH-1`, `F-MOTION-1`,
in `introduction.blip-rules.yaml`. If the five kinds are to stay five, file them under `P`.

### Q10. What does the project's `CLAUDE.md` say in each configuration?

Without any pointer, the `cli` configuration measures whether an agent stumbles on
`node_modules/.bin/blip`, not whether the CLI helps.

**Recommendation.** Every configuration gets the same paragraph: what the game is, that its UI
is built with `@sebald/blip-ui`, the commands (`pnpm typecheck`, `pnpm build`; do not start the
dev server), how a screen is opened. Every configuration from `cli` on adds one line: "Blip
UI's docs, examples and rules: `pnpm exec blip`". That is what `blip init` would leave in a real
project. An unannounced CLI can be a seventh switch later if discoverability becomes the
question.

### Q11. Raw HTML tags and `className` cannot be faults as such

**Found (read).** Blip has no layout component. Its own full screens place everything with raw
`div`s and classes (`compositions/together.stories.tsx:94,131,162`), and every component takes
`className` "for the one-off placement on a screen" (`building-components.mdx:52-53`). Pushback,
the correct consumer, has 144 `className`s and about 44 raw tags in its 17 UI files (**ran**:
counted with grep).

**Recommendation.** Report both as counts, never as failures, split by what they are:

- A raw tag Blip has a component for (`button`, `h2`, a list of choices) against a wrapper
  (`div`, `span`) that only places.
- A class that places (position, inset, size, grid, margin) against one that restyles (colour,
  font, padding, border), using the same tokenising `uniformity.test.ts:19-37` does.

Expect "a layout component" to be the first gap agents hit. Whether Blip grows one is a
day-zero decision; leaving it open on purpose would give gap drafts a steady target.

**Answer.** Accepted, plus a check for overrides that recur: an override that many agents write
independently is a variant or size Blip is missing. `collect.mjs` groups restyling classes by
the Blip component they sit on (normalised: sorted, the same tokenising as above), and raw tags
by tag and classes. A group seen in at least 3 runs across at least 2 tasks of one label is
listed in `summary.md` as a candidate variant, size or component, with its runs and lines.
Placing classes are left out: a margin on a `Button` says nothing about the `Button`. The
thresholds are a guess for 36 runs; day zero adjusts them. In `eval-collect`.

### Q12. Where do patterns live? There are none today

The plan step looks up "a pattern", and `P` rules need a page. Blip has component pages only;
its two full screens are stories without a page (`compositions/together.stories.tsx`).

**Recommendation.** `src/patterns/<name>.mdx` with sidecar and examples, same build. Start
with the two that exist (`menu-screen`, `duel`) in `examples-and-patterns`. Further patterns
(a shop, save slots, a HUD) come from the research catalog and day zero, each as its own page.
Note the tension: a pattern page for exactly what a task asks makes that task easy. That is
the effect to measure, but the sweep should say which tasks had a matching pattern.

**Answer.** Accepted, and patterns are written on purpose, not only when one turns up: a new
task, `patterns`, after day zero, writes three or four pages chosen from the research catalog
and what day zero's agents built by hand. To keep the tension measurable, two of the six eval
tasks (`quests`, `camp-rest`) get no matching pattern, and the sweep reports matched and
unmatched tasks apart.

### Q13. Model, repetitions, and how much of the subscription a result uses

**Answer.** Everything runs locally, on your Claude Code subscription, no API key. Model and
repetitions as recommended below.

**Found (ran).** A headless `claude -p` in a scratch directory, with no `ANTHROPIC_API_KEY`
set, reports `"apiKeySource":"none"` in its `init` event: it runs on the logged-in claude.ai
account, like your interactive sessions. It still reports a `total_cost_usd` ($0.0004 for a
one-word answer), but that is an estimate at API prices, not a charge.

What follows from running on the subscription:

- **The limit is the subscription's usage limit, not dollars.** The eval shares it with your
  own work. `run.mjs` runs one task at a time by default (`--parallel n` to change it), and a
  label can be run in parts (`--tasks`, `--reps`) and resumed: runs already in the cache are
  skipped.
- **A run that hits the usage limit is not a result.** `run.mjs` recognises the limit error in
  the result event, stops the label, and reruns that run from a fresh copy after the reset,
  marked in `meta.json`. The exact form of that error is checked in the pilot.
- **`run.mjs` removes `ANTHROPIC_API_KEY` from the child's environment** and fails a run whose
  `init` event names any key source other than `none`, so no run is billed by accident.
- **`--max-budget-usd` stays**, as a cap on the estimate: it stops a run that loops, which
  matters on a subscription too. $4 per run to start; after the pilot, twice the largest pilot
  run.
- **Cost in the results** is tokens and the estimated dollars, labelled as an estimate. That is
  enough to compare configurations, which is all measure 7 is for.

Confirmed:

1. **Which model does the agent run on?** Recommendation: `claude-sonnet-5-5` for every
   comparison, and the two ends again on `claude-opus-5-5` after the sweep. Sonnet also uses
   the usage limit more slowly than Opus.
2. **How many runs per task?** Recommendation: 3 for day zero (36 runs), 5 for the sweep (180).
   If the pilot shows a run uses too much of a usage window, the sweep can drop to 3
   repetitions, and its write-up says so: the spread gets wider and only large effects show.

Nothing is measured yet, so these are starting values for the pilot in `day-zero` to replace.

**Model.** One model for every run of a comparison, pinned by its full id:
`claude-sonnet-5-5`. It is cheap enough for repetitions and leaves room for a harness piece to
show an effect. After the sweep, repeat the two ends (`cli` and `full`) on `claude-opus-5-5`
to see whether the findings hold on a stronger model. Record the Claude Code version with
every result: the agent's own harness changes too.

**Repetitions.** 3 for day zero (36 runs), 5 for the sweep (180 runs). With 6 tasks and about
5 statements each, a configuration in the sweep has about 150 judged statements. That shows
large effects only; `summary.md` gives counts and the spread, and makes no claim inside it.

**Size (guess).** At API prices I would expect a UI ticket to be worth $0.50 to $2 of tokens,
so day zero is roughly $20 to $70 of estimate and the sweep $100 to $350, plus the judge (on
Opus, one short pass per run). On a subscription that is a question of how many usage windows
it takes, which only the pilot can answer: it records each run's tokens and how far it moved
the usage shown by `/usage`.

The cap is an estimate on the client and can be overshot (**docs**); a run that hits it ends
with `error_max_budget_usd` and is reported as over budget.

### Q14. The judge

**Recommendation.** `claude-opus-5-5`, called through headless Claude Code with `Read` only,
in a directory that holds the task, the rubric, the diff of `src/` and the screenshots. Blind:
no `.blip/`, no `CLAUDE.md`, no configuration name. One pass per run. Trust in it comes from
two things, not from repeating it: its agreement with you on hand-labelled runs (six before day
zero, a sample in every later result), and your reading of every failed run. A statement the
judge and you disagree on twice is a badly written statement and is rewritten.

### Q15. The reviewer: who fixes, and what stops a loop?

**Recommendation.** The reviewer fixes. It is a subagent with edit tools that runs
`blip review`, fixes, runs it once more and returns the summary. That keeps the loop inside
one context whose tokens can be measured, and the main agent only relays. `blip hook stop`
holds a stop at most twice per turn (logged), well under Claude Code's own limit of eight
consecutive holds (**docs**), and checks `stop_hook_active`.

Considered and set aside: a Stop hook of type `agent`, which Claude Code offers
(**docs**: experimental, 60 s by default). It would move logic out of the CLI and could not be
called by another agent.

### Q16. What if the plan skill does not fire?

A skill is picked by its description. Whether that happens reliably in a headless run on a
ticket that never says "plan" is unknown; the `plan` configuration measures it (lookups before
the first write, skill invoked or not).

**Recommendation.** If it fires in fewer than about two runs in three, add a third hook as its
own configuration: `UserPromptSubmit` calling `blip hook prompt`, which adds one line of
context ("this project's UI is Blip; look up the pattern first: `blip search`"). The docs say
this hook can add context. Decision 5 names two hooks, so this is your call when the number is
in.

## Smaller things, settled from the code

No answer needed unless you disagree. Each is in a task.

| Found                                                                                                                  | Where                                                                  | What the plan does                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm pack` works on the private package; today's tarball has `src`, stories, tests, 154 PNGs                          | **ran**                                                                | `files` and `publishConfig` in `pack-build`                                   |
| `exports` point at `src/`; the site and Pushback rely on it                                                            | `packages/blip-ui/package.json:10-16`                                  | Unchanged; `publishConfig` swaps them at pack time. `bin` only there too      |
| `pnpm test` would not run tests in `cli/`                                                                              | `package.json:56` (`packages/*/src/**/*.test.ts`)                      | Glob extended in `cli-lookup`                                                 |
| Blip's `tsc` would not check `cli/`                                                                                    | `packages/blip-ui/tsconfig.json:19-25`                                 | `include` extended in `cli-lookup`                                            |
| The root `tsc`, oxlint and oxfmt would pick up `evals/blip/template` and generated folders                             | `tsconfig.json` (`**/*.tsx`), `.oxlintrc.json:90-99`, `.oxfmtrc.json`  | Excluded in `pack-build` and `template`                                       |
| `react` is an exact peer (`19.3.1`)                                                                                    | `packages/blip-ui/package.json:27-30`                                  | The template pins the same version                                            |
| `escapes()` reads `#storybook-root`                                                                                    | `tests/visual/layout.ts:15`                                            | A root parameter in `eval-rendered`                                           |
| The spacing, text, opacity and layer checks are inline in the test; only the motion ones are exported                  | `foundations/uniformity.test.ts:64-190`, `foundations/motion.ts:22,51` | Moved to `src/foundations/` in `validate`                                     |
| MDX pages use only `Meta`, `Canvas` and `Controls` outside code fences                                                 | **ran** (grep: 24, 51, 21)                                             | Text substitution, no MDX compiler                                            |
| `Stage.Center` is exported and on no page                                                                              | `stage/stage.tsx:216`, `stage.mdx`                                     | The build lists undocumented exports                                          |
| `Stage` takes JSX through `turned` and `small`, which Blip's own building rules advise against                         | `stage/stage.tsx:72,80`, `building-components.mdx:57-58`               | Nothing: a builder rule, out of scope. Rule extraction will meet it           |
| Under about 770 px the stage shows `small` instead of the game                                                         | `stage/stage.tsx:74-78`                                                | The wide viewport is 960 × 600, the phone 402 × 714 (`stories.spec.ts:38-44`) |
| `axe-core` is installed only through Storybook's addon                                                                 | **ran** (`pnpm why axe-core`)                                          | A root dev dependency in `eval-rendered`                                      |
| A hook's default timeout is 600 s; its output is cut at 10,000 characters                                              | **docs**                                                               | A timeout on each entry; at most 5 findings per reply                         |
| The `init` event lists loaded `plugins`, `skills` and `agents` by name                                                 | **ran**                                                                | `run.mjs` checks it for every run                                             |
| Only `summary.md` and `results.json` are committed, so transcripts and screenshots exist only in `~/.cache/blip-eval/` | decision 8                                                             | Keep a label's cache until its write-up is done                               |
