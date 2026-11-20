---
status: doing # todo | doing | done
step: F
depends: [cli-lookup]
pr: https://github.com/sebald/sebald.me/pull/199
---

# `manifest-props`: Put every component's props, values and defaults into the docs

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

**Depends on.** [`cli-lookup`](cli-lookup.md).

**Changes in the eval.** Enables the "invented props" metric to be exact. Docs get longer:
watch tokens per `blip docs` call.

## Notes

**Changed.** `cli/build/props.ts` (new; the only module that imports `typescript/unstable/sync`,
so the CLI runtime never loads it), `props.snapshot.json` + `props.test.ts`, `cli/section.ts`
(`--section`). Small additive edits: `build/manifest.ts` (`props`, `htmlProps` on an export,
`withoutDescription`), `build/convert.ts` (third argument: what `<Controls />` becomes),
`build/index.ts` (props, second render of the pages, log), `io.ts` (`--section`),
`commands/docs.ts`, `commands/index.ts` (usage line), README. No component, story or MDX changed.

**Numbers** (tarball from `pnpm pack`, installed with `file:` into a scratch app). 140 own props over
the 44 component exports with props (157 exports). 39 props have no description, listed by the
build (mostly `className`, `style`, `children`, a few callbacks: `Confirm.onConfirm`,
`Tabs.onValueChange`, `PickerItem.onSelect`, ...). Props sections add 18.7 KB to 64 KB of pages
(largest: `picker` +3.1 KB); tarball 100 to 114 KB, `manifest.json` 61 KB. `pnpm pack` 2.5 to 3 s
(the checker is about 0.3 s of it); `blip docs button --section props` 0.05 s warm (0.22 s cold).
`pnpm test` 405 pass; lint, format, Blip typecheck pass; root `pnpm typecheck` 34 environmental
errors, same as `origin/blip-harness`. No story or page changed, so no Storybook look changed and
`pnpm vrt:blip-ui` was not run.

**Decisions.**

- Own props (declared outside `node_modules`) are listed; what comes from a library is named once
  as `htmlProps` (the `extends` text, e.g. `ButtonHTMLAttributes<HTMLButtonElement>`), set only when
  an inherited prop names an `HTML*Element`.
- `type` is the source text of the annotation (so values keep their source order: `primary`,
  `secondary`, `destructive`; the checker sorts by id); `values` are the checker's literal members.
  A prop typed by an alias (`IconName`) shows its values in the table beside the alias.
- Unreadable = `typeof` or `X[...]` in the written or resolved text, or an indexed access/`keyof`
  left in the resolved type: the build throws.
- `<Controls />` becomes `## Props` (a table per component of the page, the page's own first); a
  page without `<Controls />` (`ledger`) gets it before its first `##`. `--section <name>` matches
  a `##` heading by name or first word; unknown name exits 2 and lists the sections.
- The snapshot is a JSON file (`UPDATE_SNAPSHOT=1 pnpm test` rewrites it) over Button, Dialog,
  IconButton, Meter, not `node:test` snapshots (experimental flag).

**Review** (subagent, fresh context). No blocking findings. Fixed: alias types showed no values in
the table (should-fix, now shown); `| undefined` was stripped inside nested types (now only at the
end); a comment in a written type would leak into the table (falls back to the resolved text);
`--section=a=b` truncated. Answered: `Stage.Center` is on no page (pre-existing, listed by the build,
its only prop is `className`); numeric values and `number | 'fit'` give partial `values` (accepted,
the `type` text is complete); the long no-description list is what the task asks for; a page with
its own `## Props` would get a duplicate (none is shipped); `--json` errors go to stdout with
exit 2 like `docs`'s other JSON errors.
