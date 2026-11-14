---
status: todo # todo | doing | done
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

Filled in while the task is worked on: what changed, decisions, numbers.
