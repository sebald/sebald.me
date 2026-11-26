---
status: doing # todo | doing | done
step: N+ # asked for by the user after window-scroll
depends: []
pr:
---

# `simplify-components`: A /simplify pass over every component

**Problem.** The last few weeks reworked the field, stepper, text field, menus, buttons and windows in quick steps. Leftovers of removed layouts, duplicated helpers and work done twice are likely, and nobody has read the components side by side.

**Outcome.** Six agents review the 27 components in groups from /simplify's four angles (reuse, simplification, efficiency, altitude), read-only. The main agent checks each finding against the code, keeps the ones that change no behaviour and no pixel, and integrates them in one pull request. A finding that would change what a player sees is listed, not done.

**Acceptance criteria.**

- Every kept finding verified by hand; skipped ones listed with why
- No baseline changes (the pass changes no pixel); `pnpm test`, lint, typecheck, `pnpm test:game` pass
- A fresh-context review in the pull request

## Notes

Six read-only agents reported 49 findings. Each was checked against the code. Kept and integrated:

- **timer**: `style` was declared twice (it comes from `SVGAttributes`)
- **readout**: `say` is used only inside `announce.ts`, so it is no longer exported
- **button**: `style` passes through `...props`; the two clip paths are module constants, not rebuilt each render
- **icon-button**: the cursor span is written once, not twice; the styles are one object (`root`, `cursor`) like every other component's
- **dialog**: two doc comments stacked on one variant merged into one
- **tabs**: the face's and the light's shared inset is one constant
- **bitmap-text**: removed `BitmapRect.letter`, which nothing read; `FONT` and `GLYPH` are no longer exported; the two ink maps are one helper (same rects, same order)
- **stamp**: `stampSize` computes the size from the letter count (shared `sizeOf`) instead of drawing every pixel to measure it
- **pixel-icon**: its class moved into a `pixel-icon.styles.ts` like the rest
- **screen**: `centered` repeated the base's `--s-bottom` and padding, which tailwind-merge collapsed anyway
- **stage**: `use-scale` and `use-snap` had the same device-pixel-ratio watcher; it is now `watchPixelRatio`
- **stepper**: comments still named the removed `Setting` layout; a run-on line rewrapped; "step forward" written once
- **text-field**: the limit message written once
- **picker**: `choose` was three layers (module function, `pick`, context key); it is now one

Skipped, with the reason:

- **A shared cursor utility** (button, icon-button, field, picker, setting): changes the generated CSS order and the pins in `uniformity.test.ts`. Worth doing as its own change
- **Form `focusin` effect → `onFocus`**: React's `onFocus` also bubbles through portals, so this is not strictly the same
- **Picker effect early returns and context split** (`useNotePlace`, the cursor repair, `scrollTop` out of context): small gains on short lists, and they touch effect timing
- **`Window` = `WindowFrame`**: the two names are documented apart (`building-components.mdx`), and the docs' props table comes from `Window`
- **Stage `bar` prop unused**: removing it changes the public API
- **Timer `beat` algebra**: the same on paper, but float rounding could move a beat at its edge
- **bitmapTextSize upper-casing**: changes behaviour (ß)
- **Shared figure class (readout, ledger), typewriter's empty cva, field count's `data-disabled`, a `wrap` helper, `PickerItem = Row`, defaults in setting, speech-bubble background**: house style, or too small to be worth the churn
