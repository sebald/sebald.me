// Snap the drawn stamps (`sheets/stamps.png`) to the game's colours:
// each pixel classed as the ink outline, the plate, the shadow, or the stamp's
// ink in three shades (the second cell, FLAWLESS, in gold). The colours are
// PALETTE's: ink, fill, fillShade, stamp and gold with their ramps.
//
//   node .claude/skills/pixel-sprite/scripts/stamps.mjs <in.png> <out.png>
import sharp from 'sharp';
const [src, out] = process.argv.slice(2);
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const C = {
  ink: hex('#0b0d16'),
  plate: hex('#131829'),
  shadow: hex('#0a0d1a'),
  red: [hex('#f58a6e'), hex('#d9483b'), hex('#9e2a25')],
  gold: [hex('#fff1b8'), hex('#f2c14e'), hex('#b8871f')],
};
const CELL = 80,
  GOLD_CELL = 1;
const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const counts = {};
for (let i = 0; i < data.length; i += 4) {
  if (!data[i + 3]) continue;
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  const x = (i / 4) % info.width;
  const gold = Math.floor(x / CELL) === GOLD_CELL;
  const L = 0.3 * r + 0.59 * g + 0.11 * b;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  let k;
  if (spread > 45 && L >= 45) {
    const [light, base] = gold ? [185, 130] : [120, 72];
    k = (gold ? 'gold' : 'red') + (L >= light ? 0 : L >= base ? 1 : 2);
  } else if (b > r + 12 && b >= 38) k = 'plate';
  else if (b > r + 12) k = 'shadow';
  else k = 'ink';
  counts[k] = (counts[k] || 0) + 1;
  const c = k.startsWith('red')
    ? C.red[+k[3]]
    : k.startsWith('gold')
      ? C.gold[+k[4]]
      : C[k];
  data[i] = c[0];
  data[i + 1] = c[1];
  data[i + 2] = c[2];
  data[i + 3] = 255;
}
await sharp(data, { raw: info })
  .png({ palette: true, colours: 16, dither: 0 })
  .toFile(out);
console.log(counts);
