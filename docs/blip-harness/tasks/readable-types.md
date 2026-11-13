---
status: todo # todo | doing | done
step: A
depends: []
pr:
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
