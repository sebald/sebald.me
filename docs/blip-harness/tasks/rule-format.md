---
status: doing # todo | doing | done
step: F
depends: [cli-lookup]
pr: https://github.com/sebald/sebald.me/pull/200
---

# `rule-format`: Give rules a sidecar format, generate `rules.json`, render them on a page

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

- [x] A unit test per build failure: duplicate id, id against kind or page, no check and no
      marker, and (as warnings for now) unknown check, unused check
- [x] The Dialog page in Storybook shows its rules through the block, and no sentence in the page
      restates one
- [x] `blip rules dialog` lists them; `blip docs C-DIALOG-1` prints the rule, the page's
      reasoning and the fix
- [x] An `[open]` rule is in `rules.json` and absent from `blip rules`
- [ ] I have reviewed the Dialog sidecar (yours; left open)

**Depends on.** [`cli-lookup`](cli-lookup.md).

**Changes in the eval.** None yet. Rule ids are what `validate` metrics are grouped by.

## Notes

**Changed.** `cli/rules.ts` (rule types, kinds, the markdown of a rule list, `reasoningOf`; pure, shared by
CLI, pack step and blocks), `cli/build/sidecar.ts` (parse with `yaml`, `checkSidecars`: no file access, so
Storybook parses with it too), `cli/build/sidecars.ts` (reads sidecars and checks from disk, builds
`rules.json`), `cli/commands/rules.ts`. `convert.ts` turns `<Rules for>` and `<Rule id>` into markdown (a
lookup is passed in; an unknown id or a page without rules fails the build), `manifest.ts` fills
`pages[].rules`, `build/index.ts` writes `docs/rules.json` and fails on the sidecar errors, `docs-dir.ts`
loads `rules.json` (absent in an older docs folder is fine), `search.ts` ranks rules (5 per term in the rule's
words; on a tie a page wins, then a rule, then an export) and `blip docs <rule-id>` prints the rule, the section
of its page that shows it (without the rule lists) and the fix. `.storybook/blocks/{rules,sidecars,index}` hold
`<Rules>` and `<Rule>`. `yaml` is a dev dependency. `dialog.blip-rules.yaml` has the five Usage bullets as
C-DIALOG-1 to 5 (1 is `error` with check `dialog-title` and the fix; 2 to 5 are `[review]`) and the SpeechBubble
`when-not`; `dialog.mdx` Usage is now prose of reasons and `<Rules for="dialog" />`.

**Decisions.**

- Id scope: `C`, `P`, `A`, `T` ids carry the page id in capitals (`C-SPEECH-BUBBLE-1`); `F` and `X` ids carry a
  topic (`F-COLOUR-1`, they have no single page), as the research candidates do.
- The build also fails on: a rule with a check and a marker, a check without a fix (spec: required with
  check), a sidecar whose `page` is not its file name, a page that is not shipped (X rules excepted), a
  `when-not.use` that is no page. Unknown and unused checks only warn; with no `cli/validate/checks/` yet every
  `check` warns (`no check "dialog-title" yet`), which is expected.
- `[open]` rules: in `rules.json` and in `pages[].rules`, but out of `blip rules` (unless `--open`), `blip search`
  and the page markdown. Storybook's block shows them marked `[open]`, because that page is where they are reviewed.
  `blip docs <open-id>` still prints one, marked.
- `<Rules>` also prints the page's `when-not` list (label "When not"); the labels of the kinds appear only when
  there is more than one list.
- The Dialog sidecar has no `[open]` rule (none of the five bullets is a question), so that criterion is proven
  by unit tests and by a tarball built with a temporary `[open]` rule (in `rules.json`, not in `blip rules`, the
  page, or search; shown by `--open` and by `blip docs`), removed again.
- The five Dialog rules are the Usage bullets only; the research candidate `P-DIALOG-201` is left to
  `rule-extraction-menus`. C-DIALOG-1's "a dialog without a name is a wall" moved to the prose as a reason.

**Checks.** `pnpm test` 418 pass, lint and format pass, Blip's typecheck passes, root `pnpm typecheck`
34 errors as on `origin/blip-harness`. Tarball installed with `npm i` in a scratch app: `blip rules dialog`
lists the five, `blip docs C-DIALOG-1` prints rule, reasoning, fix; exit codes 0 and 2 as specified. Storybook
(port 6107, Playwright): the Dialog docs page renders "Components" with the five rules, the fix and the
`checked by` note, and "When not", no console errors; no story changed, so no `pnpm vrt:blip-ui`.
`pnpm test:game` could not run here: its dev server does not start in this environment (exit 1, also with
`GAME_PORT`); nothing in the game or in `src` code changed.

**Review** (subagent, fresh context, against the task, spec 2.2 and 2.4, `AGENTS.md`, `building-components.mdx`).
Nothing blocking; it confirmed `yaml` is reached only by the pack step and Storybook, never by the shipped CLI.
Fixed: `yaml` pinned to `2.9.1` like the other dependencies; `<Rules>` now fails the build when a page has only
`[open]` rules (it would have left a gap), with a test; a `parseArgs` test for `--kind` and `--open`. Answered:
an unknown `check` only warns because the task says so, and `validate` has to turn it into an error (the warning is
the one place, `checkSidecars`); `<Rule>` is also expanded inside an inline code span, which matters only if a page
ever documents the block syntax, so left; `--kind` and `--open` are accepted and ignored by other commands, left;
`RULE_ID` matches any `x-foo-1` shape and clashes with no page or export today; `building-components.mdx` is the
rules for building Blip and not shipped, and the spec carries the sidecar format, so no new prose there.
