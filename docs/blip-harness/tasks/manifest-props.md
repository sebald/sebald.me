---
status: todo # todo | doing | done
step: F
depends: [cli-lookup]
pr:
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

Filled in while the task is worked on: what changed, decisions, numbers.
