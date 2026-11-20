---
status: doing # todo | doing | done
step: F
depends: [cli-lookup]
pr:
---

# `examples-and-patterns`: Move examples into files that stories and the CLI both read

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

**Depends on.** [`cli-lookup`](cli-lookup.md).

**Changes in the eval.** What the plan step can find. Metric: which examples were opened.

## Notes

**Changed.** `packages/blip-ui/src/**/examples/*.tsx`: 25 example files, one component each, with
a doc comment that says it in a line. 23 on component pages (one each, `picker` and `window`
two) and 2 on the new pattern pages `menu-screen` and `duel` (`src/patterns/<name>/<name>.mdx`,
with `<name>/examples/`). Id = `<page>/<file>`, for example `dialog/options`. 14 composition
stories (and `Dialog`, `Parts`, `Stage`'s `Default`, `Controls`' none) now render an example
instead of holding the JSX; the two `Together` stories render the pattern examples. The pack step
(`cli/build/examples.ts`, called from `build/index.ts`) rewrites every relative import to one
`import { … } from '@sebald/blip-ui'` (names sorted), and fails on a story, a test, another example,
a default or namespace import or a name `src/index.ts` does not export. `<Canvas of={X.Story}>` becomes
the source of the example that story renders (found through the story file's `./examples/`
import), else it is dropped. Manifest: `examples[]` (`id`, `page`, `title`, `summary`, `file`)
and `pages[].examples`. `blip examples [<page> | <id>]` (list, print, `--json`, closest name,
lookup events); `search` returns examples after their page. `tsconfig.build.json` leaves
`examples/` out of `dist`; `uniformity.test.ts` skips them like stories. Docs: `building-components.mdx`
has an Examples section, `AGENTS.md` one clause.

**Numbers.** Tarball 117 KB (was 100 KB). 25 pages (23 + 2 patterns), 157 exports, 25 examples,
the same 42 undocumented exports. `pnpm test` 402 pass (386 before; 16 new). Root `pnpm typecheck`
34 environmental errors, as on `origin/blip-harness`, none in blip-ui. `blip search menu` lists
`menu-screen` (pattern) first, then `picker`, then the example `menu-screen/pick-a-role`.

**Proof.**

- Story ids: built Storybook index before (from `origin/blip-harness`) and after, 54 stories each,
  identical ids and tags; the only new entries are two docs pages (`patterns-duel--docs`,
  `patterns-menu-screen--docs`), which the visual tests do not screenshot.
- Rendering: all 54 stories screenshotted in Chrome from both builds, wide at 3x and tall at 1x
  (`globals=layout:tall;scale:1`), animations off: 54 of 54 byte-identical both times (their DOM, ids
  stripped, also matches except the Scrolling list, whose stage lost a `max(…, 0em)` that was `0`).
- VRT in Docker: **not run**, the Docker daemon is not running here. The pixel comparison above is the
  stand-in; the draft PR's "Blip UI Visual Regression" runs after merge and must pass without new baselines.
- `pnpm test:game`: **not run**, `pnpm dev` stops at Next 16.4.2's security notice (and port 3000 is
  taken). No game or component code changed.
- Consumer check: `pnpm pack`, installed into a scratch app (`file:`), `docs/examples` copied out and
  `tsc --strict` (react-jsx, `noUnusedLocals`) over all 25 files against `dist/`: clean.
  `blip examples dialog` lists, `blip examples dialog/options` prints the source, `blip docs dialog`
  shows it where the `<Canvas>` was.

**Decisions.**

- Pattern pages live in a folder per pattern (`src/patterns/menu-screen/menu-screen.mdx`), like
  components, not the flat path of the spec: examples sit beside them and the page id is the file name.
- Examples take the story's args as props where `Default` is the composition (`Options`, `InAWindow`
  of parts, `Toolbar`, `Fitted`), so `Default` renders the example and keeps its controls.
- Six pages have no composition story (`confirm`, `meter`, `pixel-icon`, `setting`, `tabs`, `text`):
  their example is new and rendered by no story, because a new story would add story ids. They are
  type-checked, listed by `blip examples`, but not inlined in `blip docs <page>`.
- Export attribution (which page an export is "on") ignores the examples' source (`prose`), so
  `Pixels` and `usePixels` stay undocumented rather than landing on `picker`.
- Where a story and its example have one name the story imports it aliased (`PairExample`).
- `Stage`'s `Default` now renders `Fitted`, which also passes `turned`; at a fixed scale it is never shown
  (checked: identical screenshots).

**Review** (subagent, fresh context). Nothing blocking. Fixed: the `setting/volume` example used raw
buttons and a `1ch` gap (now `Button`, token spacing); a test that every component page has an example
(`cli/build/pages-have-examples.test.ts`); comments on `active={false}` and on the frozen duel values;
a line on both pattern pages that the example needs a `Stage` parent. Answered, not changed: the
consumer type-check is run by hand (above), not in CI, since it needs a tarball install (a later
task can add it to the pack step); the `Together` decorator keeps its own toolbar JSX (a decorator,
not a story render); `exampleOfStory` takes the first example a story renders (one today); examples are
skipped by `uniformity.test.ts` as stories are; pages without a story do not inline their example in
`blip docs` (a line pointing to `blip examples <page>` is a small later change).
