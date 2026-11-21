# Blip UI harness: journal

The story of building the harness, for a blog post later. One entry per milestone: what happened,
what was decided and why, what surprised us, the numbers, links. The detail lives in the task
files' Notes and the pull requests; this is the thread through them. Newest last.

## How the work is organised

- **Blip UI as a playground.** The lab's pixel-game design system stands in for a real one, so
  the harness (rules, a CLI, a per-edit hook, a reviewer, gap drafts, an eval) can be built,
  measured and written about in public.
- **A plan, then 26 tasks.** [`spec.md`](spec.md) holds the design, [`open-questions.md`](open-questions.md)
  the questions it left (Q1 to Q17), [`tasks/`](tasks/README.md) one file per task in steps A to M, each
  with its acceptance criteria and a Notes section filled in while it is worked on.
- **One pull request per task into a long-living branch.** `blip-harness` is a draft pull request
  against `main` (#186), so every workflow runs on it after each squash merge. Pull requests into
  it run only the test workflow.
- **Agents do the tasks, one coordinating session merges.** Each task runs as a background agent
  in its own git worktree, opens its pull request and stops. Before opening it, a second agent
  with fresh context reviews the diff against the task, `AGENTS.md` and `building-components.mdx`;
  its findings and answers are in the pull request. The coordinating session verifies (often by
  running the thing itself), rebases, merges and checks #186.
- **The human decides, reviews taste, and approves anything that costs or is visible.** Merges,
  real agent runs, screenshot baselines and component designs wait for a yes. Screenshot tests
  are never started without asking.
- **Side agents.** Short notes from other sessions watching the work ("this will break the
  screenshot check", "day zero packs the wrong commit") turned out to catch real mistakes.

## 2026-11-16 · Step A: research, eval tasks, packing

- **Eval tasks** (#190): six tickets for a made-up 2D adventure game, _Ford_: `shop`, `saves`,
  `pause`, `fight-hud`, `quests`, `camp-rest`. Each has a `rubric.json` of yes-or-no statements,
  some "unstated" (what a good result does without being told), each judged from the diff or from
  one named screenshot. Decision: a generic game, not Blip's own game, so nothing is learnt by heart.
- **Research** (#189, #191): a catalog of 64 game UI elements and about 120 candidate rules from
  game UX sources (Xbox accessibility guidelines and others) and web UX and accessibility sources
  (WCAG, NN/g, GOV.UK), plus 16 conflicts between the two worlds.
  - _Surprise:_ a fresh-context review found about a dozen rules citing sources that only touched
    the topic. Every source was then re-read against its rule, and rules no source supports were
    marked `[open]` as Blip's own call. The lessons went to the second research agent before it
    opened its pull request: one requirement per rule, keep the source's own exceptions, don't
    contradict the rubrics.
- **Packing** (#193): `pnpm pack` makes a tarball with only what a consumer gets (130 files,
  71 KB), so the eval installs Blip like a real app would.
- **CI** (#194, #195): the test workflow runs on pull requests into `blip-harness`.
  - _Mistake:_ the first version of #194 also enabled the screenshot workflows, which started a
    visual regression run without asking. It was cancelled, and the screenshot workflows stay on
    `main` and #186 only.

## 2026-11-17 · Readable types

- **#196:** every prop that picks from options says them in its type (`variant?: 'primary' |
  'secondary' | 'destructive'`), checked against the styles with `satisfies`, so an editor's hover,
  a type error and the emitted `.d.ts` name the values. A test fails when a story's controls or
  `Overview` miss a value.

## 2026-11-19 · Step B: the template game and the `blip` CLI

- **Template** (#197): _Ford_, a Vite + React + Tailwind app with its own data, seven fixtures and
  a marsh-green theme, and one screen (`camp.tsx`) written without Blip. It builds against the tarball.
  - _Surprise:_ the rubric assumed the camp's `window` key listener isn't silenced by a dialog
    on top. Testing showed a Blip `Dialog` keeps the arrow keys from it but not Enter. The rubric's
    note was corrected, so a judge doesn't fail a correct pause screen.
- **CLI** (#198): `blip`, `blip search`, `blip docs`, reading Markdown pages generated at pack time
  from the Storybook MDX. 23 pages, about 50 ms per command, no dependencies. A lookup is logged
  to `.blip/events.jsonl` unless `BLIP_EVENTS=off`.
  - Decision: no CLI framework. Node's argument parsing and a command table keep it small, which
    matters once a hook calls it on every edit.

## 2026-11-20 · Steps C and F in parallel

Five agents at once: the eval runner and collector (C), and props, examples and rules for the
CLI (F). The three F tasks edited the same CLI files, so each merge meant a rebase that combined
the features by hand.

- **Props** (#199): every component page gets a props table from the type checker (140 props);
  the build fails on a type it can't read.
- **Examples and patterns** (#203): 25 example files that the stories import and the CLI prints;
  two pattern pages. Story ids unchanged, 54 of 54 screenshots identical.
- **Rules** (#200): a YAML sidecar per page (id, severity, a check with a fix, or a `[review]` /
  `[open]` marker, source), rendered on the Storybook page by a `<Rules>` block and printed by
  `blip rules` and `blip docs C-DIALOG-1`. The Dialog's five rules were reviewed by hand.
- **Runner** (#202): one isolated copy of the template per run, headless Claude Code on the
  subscription, a wall-clock limit, skip and resume.
  - _Surprise, the canary:_ a cheap check before each batch asks the agent whether it can see
    the user's global `CLAUDE.md`. It could. On Claude Code 2.1.329, `--setting-sources project` no
    longer keeps it out (Q7). Fixed with `claudeMdExcludes` written at run time.
  - Decision: the child gets an allowlist of environment variables, so no `GITHUB_TOKEN` or other
    secret reaches an agent under test.
- **Collector** (#201): turns runs into `results.json` and `summary.md` (tool calls, lookups,
  TypeScript errors, raw HTML, invented imports, cost).
  - _Surprise:_ collecting the first real pilot run found two bugs no fixture showed. The pilot
    agent wrote every file through Bash heredocs, which the collector didn't count as writes. And
    the template failed `tsc` outside the repo: inside it, `@types/node` was borrowed from the
    root's `node_modules` (#204, now checked before every batch).

## 2026-11-20 · Marigold's agent cards, and why Blip doesn't need them

Marigold's agent-docs study (DST-1991) found short per-component "cards" (500 to 1,800 tokens,
against 5,000 to 29,000 for its docs pages) cut cost by 26% and turns by 37%. Blip's pages,
measured the same day, are already about card size (median about 3 KB, the largest 10.5 KB),
because the CLI tasks dropped inherited props and Storybook blocks. Two lessons were taken over
instead (#205): `CLAUDE.md` must name `validate` (in Marigold's study agents with cards never
found it, 0 of 10 runs, until one line named it), and an index of components is Q17, to decide
from day zero's lookups. Rules stay in YAML: people read them on the rendered page, agents
through the CLI, and the fields need checking.

## 2026-11-20 · Day zero

The baseline (#208): six tasks, `no-cli` and `cli`, three repetitions each, 36 runs on one
tarball of Blip after steps A and B.

- _Mistake caught by a side agent:_ step F had been merged just before day zero started, so its
  tarball already held the props, examples and rules a later comparison should show the effect
  of. The run was redirected to a tarball packed from the commit before step F; the 27 runs
  already made on the newer one are kept as a free first look at step F.
- **Cost:** $4.98 (estimated) and 27 minutes for the 36 runs, about $0.13 to $0.15 and 7 to 8
  turns a run. All 36 built with no TypeScript errors.
- **Finding:** layer 1 cannot tell `no-cli` from `cli`. Only the lookups differ (0 against 9
  `blip` calls a run), and Tailwind classes (6 of 18 runs without the CLI, 0 of 18 with it). The
  CLI changes how agents look things up, not yet what they build; the rendered layer and the
  judge have to show more.
- **What agents invented:** the same hand-written full-screen frame in 21 of 24 screens, a
  two-line list item in every `quests` and `saves` run, two time formatters in every `saves` run.
  Four components proposed from it (`screen-layout`, `number-readout`, `picker-item-parts`,
  `time-readout`), all accepted.

## 2026-11-20 · More components, on Base UI

- Decision: Blip should look more like a real design system, so agents have to choose. Six
  common components were drafted (#209): `text-field`, `switch`, `portrait`, `divider`, and
  `notification` and `empty-state` held back until after the sweep, so gap drafts still have those
  two gaps to fire on.
- Decision: build on Base UI where a primitive fits (#211): Field and Input, Switch, Avatar,
  Separator, Meter, Toast. Today only `Dialog` and `Tabs` use it.
- Process: components get a design review before merging. Screenshot baselines are made per pull
  request (with the user's yes), a first pass checks them against Blip's conventions, then the
  user looks at all of them in one local Storybook.

## Numbers so far

|                                          |                                                            |
| ---------------------------------------- | ---------------------------------------------------------- |
| Tasks done                               | 15 of 26 (A, B, C, D, F), plus 10 component tasks proposed |
| Pull requests merged into `blip-harness` | 20 (#189 to #211)                                          |
| Real agent runs                          | 66 (pilot, day zero, the step-F runs), about $9            |
| Tests                                    | 455                                                        |

## For the post

Threads worth pulling on:

- An eval is only as good as its isolation: the global `CLAUDE.md` leak, the borrowed
  `@types/node`, the wrong tarball. Each looked fine until a real run.
- "Does the CLI help?" The first honest answer was "not measurably, yet".
- Agents reproduce the same hand-built pieces run after run; that is the list of missing components.
- Fresh-context reviews and side agents catch what the working agent can't see.
- The human's part: decisions, taste, and saying yes to anything that costs or shows.
