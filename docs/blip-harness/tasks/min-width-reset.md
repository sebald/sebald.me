---
status: doing # todo | doing | done
step: N+ # found while cleaning up the stepper (help-column)
depends: []
pr: 248
---

# `min-width-reset`: A `min-w-*` class wins over the site's reset

**Problem.** The site's reset `* { min-width: 0 }` (`src/css/styles.css`) was unlayered, and an unlayered rule beats every layered Tailwind utility. Inside the site every `min-w-*` class came out 0: Blip UI's `IconButton` lost its 44 CSS pixel thumb width (`min-w-11`), the ledger's leader its minimum, Pushback's result its `min-w-[8ch]`, the site's menu (`min-w-40`) and narration player (`min-w-28`) theirs. Found when a `Setting` value moved to `min-w-[6ch]` and collapsed in the game (2026-11-26).

**Outcome.** The `min-width: 0` reset is in `@layer base`, under the utilities; `text-box` stays as it was, since the kit and the game override it unlayered.

**Acceptance criteria.**

- The site's, the game's and Blip UI's screenshots looked at; every change is a `min-w-*` now applying
