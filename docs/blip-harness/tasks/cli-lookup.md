---
status: doing # todo | doing | done
step: B
depends: [pack-build]
pr:
---

# `cli-lookup`: Ship a `blip` command that searches and prints the docs

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

**Depends on.** [`pack-build`](pack-build.md).

**Changes in the eval.** Enables the `cli` configuration. New metrics: `blip` calls by command,
and lookups before the first `.tsx` write.

## Notes

**Changed.** `packages/blip-ui/cli/`: `bin.ts` (shebang, calls `run`), `run.ts` (dispatch),
`io.ts` (argument parsing), `commands/{index,search,docs}.ts`, `search.ts` (ranking, closest
name), `docs-dir.ts` (finds `docs/` above the module and loads it), `events.ts`, and
`build/{convert,exports,manifest,index}.ts` for the pack step. `publishConfig.bin` is
`blip: ./dist/cli/bin.js`, `files` gains `docs`, `prepack` now also runs
`tsc -p tsconfig.cli.json` and `node dist/cli/build/index.js`. `cli/**` is in the package's
`tsconfig.json` and the root `test:lib` glob; `packages/blip-ui/docs` is in `.gitignore`, both
oxc ignore lists and the root `tsconfig.json` `exclude`. `rewriteRelativeImportExtensions` is
on in both `tsconfig.json` files so `cli/` can write `.ts` imports (spec 2.1). README has the
`pnpm exec blip` lines.

**Numbers** (2026-11-17, from a tarball installed with `file:` into a scratch app). 23 pages
(21 components, `introduction`, `hooks`; `building-components` is not shipped), 157 exports,
115 of them on a page. `blip docs dialog` has 0 lines with `import`, `<Meta`, `<Canvas` or
`<Controls` (a `<Controls>` inside a code fence on the `controls` page stays, on purpose).
`blip search confirm before deleting` lists `confirm`, `picker`, `dialog`, `hooks`; a search with
no match prints `Nothing matches "…"` and exits 0; `blip docs nope` exits 2 and says
`The closest page is line`. Run directly (`node_modules/.bin/blip`), every command takes 0.05 s
(about 0.34 s once cold, and 0.3 s through `pnpm exec`, which is pnpm's start-up, not the
CLI's). With `BLIP_EVENTS=off`, `blip`, `search`, `docs` and a failing `docs` in an empty
directory leave no `.blip/`; without it each call appends one `lookup` line (command,
arguments, results). Tarball: 167 files, 100 KB (was 71 KB). `pnpm test` 386 pass (the new ones in
`cli/`); lint, format, Blip's typecheck pass; root `pnpm typecheck` shows the same 34
environmental errors as `origin/blip-harness` and none in `cli/`.

**Undocumented exports** (the build prints them, 42 value exports on no page): `Stage.Center`,
`TALL_BAR`, `useScale`, `ScrollRail`, `Step`, `cn`, `cva`, `px`, `lit`, `Announcer`,
`FeedbackProvider`, `PixelsContext`, `KeyLayerContext`, `useKeydown`, `isFullscreen`,
`prefersReducedMotion`, `TICK_MS`, `overflows`, the foundations' constants and helpers
(`UNIT`, `FLOOR`, `CORNERS`, `ditherRows`, `MOTION_MS`, `NATIVE`, `BACKING`, …) and
`bitmapTextSize`, `STAMP_GLYPHS`, `TIMER_SIZE`. Types are not counted: they follow their
component.

**Decisions.**

- The CLI has its own build config (`tsconfig.cli.json`, `cli/` to `dist/cli/`), next to
  `tsconfig.build.json` (`src/` to `dist/`). One config over both roots would emit
  `dist/src/` and move `dist/index.js`, which `pack-build` fixed. A later task that makes
  the CLI import from `src/foundations` will have to merge them.
- An export is "on a page" when the page of its component's folder names it (a capitalised
  name as a word, `Stage.Center` as written, a lowercase name only in a code span, so `px`
  does not count for a sentence that says "px"), else when any page does. Compound parts
  (`Stage.Center = Center`) are found by reading the component's source for
  `Name.Part =`.
- `<Controls>` and `<Canvas>` are dropped (props tables and examples are later tasks).
  Storybook links become `Text (`blip docs <id>`)`, matched on the slug's last segment.
- Search scores title and id 10, summary 4, headings 3, text 1 per occurrence (at most 5)
  per term, with stop words dropped and a light suffix stem (`deleting` meets `delete`); an
  export whose name matches a word scores 8, loses a tie to a page, and is left out when it
  only repeats its page's title. `blip docs` takes a page id or an export name, in any case.
- `--section` and rule ids on `docs` are not built (rules do not exist yet); `--json` works on
  all three commands.
- A lookup is logged also when it fails (exit 2) or finds nothing; a log that cannot be
  written never fails the command. The log goes to `.blip/` in the working directory.
