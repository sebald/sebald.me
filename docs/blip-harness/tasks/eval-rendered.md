---
status: doing # todo | doing | done
step: E
depends: [eval-collect, day-zero]
pr:
---

# `eval-rendered`: Open each result in a browser and check layout and accessibility

**Problem.** Code that builds can still put a window half outside the stage or cut a price off.
Blip already has the check for that, but it is tied to Storybook.

**Outcome.** `collect.mjs` builds and serves each result, opens each `urls[].url` of the task's
`rubric.json` (always `?screen=<name>&state=<fixture>`) wide (960 × 600) and on a phone
(402 × 714), and records layout escapes, cut text and axe violations. Screenshots are kept in
the cache, named `<url id>@wide` and `<url id>@phone`: the names rubric statements give in
`screenshot`. For a `scope: changed-lines` task, what the untouched template shows on the same
URL is subtracted, so only what the agent's change brought counts.

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
- Every `screenshot` a rubric statement names exists after collecting
- The "Blip UI Visual Regression" workflow passes on the pull request
- Day zero is collected again from the cache, and its results now hold measure 4

**Depends on.** [`eval-collect`](eval-collect.md), [`day-zero`](day-zero.md) (its runs to collect again).

**Changes in the eval.** The rendered layer: measure 4.

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

**Changed.** `evals/blip/lib/rendered.mjs` (build, static server, Chrome, `escapes()`, axe,
screenshots, the template subtraction), a hook in `collect.mjs` (`renderRuns`, run in `main`
before `collect()`, which stays synchronous and takes the result as `rendered`; `--skip-render`),
measure 4 in `lib/aggregate.mjs`, "Rendered pages to look at" in `summary.md`,
`rendered.test.mjs` with `fixtures/rendered/`, README "The rendered pass". `axe-core` 4.14.0
(the version Storybook's addon resolves to) is a root devDependency.

**Decisions.**

- `layout.ts` is at `packages/blip-ui/tests/visual/layout.ts`, not at the root as the task says. It got
  `escapes(page, rootSelector = '#storybook-root', limit = 3)`; `stories.spec.ts` is untouched and
  `#storybook-root` stays its default. The rendered pass asks for 50 so that faults the template
  already has cannot fill the list of three and hide new ones
- Root is `section[data-slot="stage"]`; its own `overflow-hidden` is not counted as a clip by
  `escapes()`, so a part outside the stage is flagged and text cut by a part's own box is "cut"
- Faults are split by shape: `"…" cut by …` is cut text, the rest escapes. Axe is per violated rule
  (`{ id, impact, nodes }`), the measure counts rules
- Screenshots: `<cache>/<label>/.screenshots/<config>/<run dir>/<url id>@wide|phone.png`, viewport
  only, also for a page that did not render (blank). A dot folder is not a configuration. The
  phone is a touch device (`isMobile`), reduced motion, scale 1
- `changed-lines`: the template is the run's first commit (`git archive`) built once per label with
  that run's `node_modules`; its faults (without their distance) and axe nodes are taken off. A
  URL the template does not render (`?screen=pause`) has nothing to subtract
- `dist` is removed and rebuilt before each render, so the picture is of the source the collector
  measured; a run that does not build is recorded as not rendered, with blank pictures
- Chrome: the installed one on macOS (as the game's tests), Playwright's on Linux; the browser
  tests skip when it cannot start

**Review** (subagent, fresh context). Fixed: one failing run stopped the whole collection (now
per-run try/catch, a missing rubric is left to `collect`); a stale `dist` was rendered; the cap of 3
faults weakened the subtraction (limit parameter); the random server port could end up in a `reason`;
a malformed request URL or unreadable file could crash the server; `subtractedTemplate` was true for
a template that rendered only in part. Left: screenshots are viewport only, not full page; no test of
`renderLabel` as a whole or of the build-failed path (tried by hand on day zero only); `package.json`
key reorder is pnpm's.
