# Fight HUD

Fights run, but the player can't see what's going on. Build the screen they
see during a fight, from the `fight` and `party` in the game state.

- Every party member with their name, HP and MP (as current out of max), and
  any status they have, like poisoned or asleep.
- Whose turn it is.
- The enemies by name, with roughly how hurt they are. No exact numbers for
  enemies: the player shouldn't know an enemy's HP to the point.
- Nothing needs to be chosen on this screen yet; the moves come in a later
  ticket.

Register it as `fight` so it opens with `?screen=fight`.
