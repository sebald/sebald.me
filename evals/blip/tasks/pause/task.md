# Pausing

There's no way to pause. Players should be able to stop, change a few options
and leave the run from anywhere in the game.

- Escape opens the pause screen over the camp. On a phone there has to be
  something to tap that opens it.
- **Resume** closes it and the player carries on where they were. Escape does
  the same.
- **Options:** music volume and sound volume (0 to 10) and message speed (slow,
  normal, fast). A change takes effect right away and is kept in the game's
  `options`, through `setOption` in `src/game/state.ts`.
- **Leave the run** ends the run through `leaveRun`.
- Works with the keyboard and on a touch screen.

Register it as `pause`: the camp with the pause screen open, so it opens with
`?screen=pause`.
