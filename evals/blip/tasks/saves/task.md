# Save and load

Players lose their progress when they close the game. Add a screen where they
can save the game and load a save, with three slots.

- Each slot shows what's in it: the place, the party leader's name and level,
  the play time and when it was saved (`slots` in the game state).
- The player can save the current game into a slot, and load a slot to carry
  on from it.
- One screen for both: the player chooses whether they're saving or loading.
- Use the game's own `save` and `load` from `src/game/state.ts`.
- Works with the keyboard and on a touch screen.

Register it as `saves` so it opens with `?screen=saves`.
