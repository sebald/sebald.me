# Shop

The town needs a shop. Players can find gold but have nothing to spend it on,
and their pack fills up with things they don't need.

Build a shop screen where the player can buy and sell.

- **Buying:** everything in the shop's stock (`SHOP_STOCK` in
  `src/game/data.ts`), each with its name, price and description.
- **Selling:** anything in the player's pack, at the item's sell price.
- The player's gold is always in view and changes as soon as they buy or sell.
- The player should see at a glance which items they can't afford. Those can't
  be bought.
- Use the game's own `buy` and `sell` from `src/game/state.ts`.
- Works with the keyboard and on a touch screen.

Register it as `shop` so it opens with `?screen=shop`.
