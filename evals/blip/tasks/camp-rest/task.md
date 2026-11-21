# Rest at camp

The party can't recover between fights. Add resting to the camp screen that's
already there (`src/screens/camp.tsx`). Change that screen; don't add a new
one.

- Resting costs `REST_COST` gold (20) and brings the whole party back to full
  HP and MP.
- The player sees what resting costs before they rest.
- After resting, tell the player it worked.
- Use the game's own `rest` from `src/game/state.ts`.

It opens with `?screen=camp`, as it does now.
