---
status: done # todo | doing | done
step: A
depends: []
pr: https://github.com/sebald/sebald.me/pull/196
---

# `readable-types`: Say each prop's options in its type

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

## Notes

Filled in while the task is worked on: what changed, decisions, numbers.

- **Eleven props, not eight.** The eight cva sites (`Button` variant and size, `Dialog` size,
  `Meter` variant and size, `Line`, `Stamp`, `BitmapText` variant) and two more that picked
  from a constant: `BitmapText`'s `size` (`keyof typeof SIZES`) and `IconName`. The review found
  an eleventh: `PickerItem`'s `variant` was a private alias (`ItemVariant`), so the `.d.ts`
  showed the alias's name; now written out. `SIZES`,
  `Meter`'s `CELL` and `ICONS` are now `as const satisfies Record<…>` against the union.
- **`satisfies` on every group a public prop picks from**, also where the prop already was a
  union (`Text` variant, `Step` points), so the convention holds everywhere. The styles file
  imports the props type (`import type`, no runtime cycle). `ClassValue` is re-exported from
  `utils/styles`. The internal `layout` of `Controls`/`IconButton` (from context, never set by
  hand) is left as it is.
- **Checked:** adding a cva key (`Button` size `tiny`), dropping one (`Meter` variant
  `secondary`) and adding an icon name without its rows each fail `typecheck`. The emitted
  `.d.ts` reads `variant?: 'primary' | 'secondary' | 'destructive'` (`Button`),
  `size?: 'default' | 'large'` (`Dialog`), `variant?: 'primary' | 'secondary'` and
  `size?: 'default' | 'compact'` (`Meter`), and `IconName` is the six names.
- **Review (fresh-context subagent, against `AGENTS.md` and `building-components.mdx`):**
  1. `PickerItem`'s `variant` group had no `satisfies` (should-fix): added, and the union
     written out in the props (above).
  2. `layout` of `Controls`/`IconButton` unchecked (nit): left. It is no prop, it comes from
     context.
  3. The test skipped a control silently when a `{…}` came before `options` or `options` was
     a variable (should-fix): it now reads every `options:` line, finds the prop on the line or
     the nearest `prop: {` above, and throws on an expression that is not in `DERIVED` (the
     two icon lists). Probed: `table` first with a value dropped fails, `options: SIZES` throws.
  4. A union wrapped over lines would not parse (should-fix): the pattern takes a leading `|`
     and line breaks. Probed with `Button`'s `variant` wrapped: passes.
  5. The `AGENTS.md` clause read tacked on (nit): moved into the parenthesis. The test's line
     in "Checked by tests" is its own paragraph.
  6. Nothing found on derived props left, the `satisfies` checks (both directions probed),
     runtime changes or the build.
- **The Overviews (raised by a second agent after the review):** each story's `Overview`, what
  the visual tests screenshot, keeps its own list (`const VARIANTS = […]`) or writes each case
  out (`Dialog`, `Text`), and nothing checked them: a new variant in the type and the controls
  would get no screenshot. The test now also fails when the Overview shows a value of a checked
  prop nowhere: it counts as shown when set (`size="large"`), in a list of the file the Overview
  uses, or as the `@default` on an element that leaves the prop out. `Dialog`'s `role` is
  exempt (`LOOK_ALIKE`): an `alertdialog` is drawn as a `dialog`. Probed: a `neutral` Meter
  variant in the type and the controls only, and `Dialog`'s `size="large"` dropped, each fail.
  28 checks in all.
- **Runs:** `pnpm lint`, `format:check`, `test` (355 pass), the three `typecheck`s, and
  `pnpm test:game` (29 passed, the 29 screenshot tests skipped on macOS). The "Blip UI Visual
  Regression" workflow is still to run.
- **The stories' options:** a unit test, not a shared constant. A constant the props derive
  from would bring `(typeof X)[number]` back into the declarations, and CI runs `pnpm test` but
  not `typecheck`. `foundations/story-options.test.ts` reads every control with written-out
  `options` (14 today) and the prop's union beside it, and fails when they differ or the prop
  has no union. It sits in `foundations/` because `uniformity.test.ts` reads every entry of
  `components/` as a component folder. The icon controls list `Object.keys(ICONS)`, right by
  construction, and are not read.
- Convention in `building-components.mdx` (Props, and the test under "Checked by tests") and
  one clause in `AGENTS.md`.
