// The corner office (the Stakeholder, the title and the roster). Windows in
// the towers behind the glass twinkle on and off, the phone on the desk
// glows and dims as a notification comes in, and rain streaks slide down
// the glass over the plain sky. Coordinates are native pixels of the padded
// 480x270 scene.
//
//   node .claude/skills/pixel-sprite/scenes/office.mjs \
//     src/assets/lab/pushback/scenes/office/native.png \
//     src/assets/lab/pushback/scenes/office

import {
  hash,
  loadScene,
  lum,
  mix,
  sat,
  scale,
  writeLoop,
} from '../../pixel-header/scripts/loop.mjs';
import { ROOM_FACTORS, shrinkFrames } from '../scripts/shrink.mjs';

const [src, outDir] = process.argv.slice(2);

const FRAMES = 96;
const DELAY = 125;
const SHOWN_WIDTH = 1920;

const scene = await loadScene(src);
const { base, rgb, setPx, collect } = scene;

const plate = Buffer.from(base);

// City windows
// ---------------
// Lit windows are warm single pixels in the towers, muted in the snapped
// palette. A few of them go dark or come on every second; the rest stay.
// The desk and the chair stand in front of the window; the lit box skips
// the desk, whose wood is as warm as a window
const CITY = { x0: 99, x1: 377, y0: 80, y1: 190 };
const onDesk = (x, y) => x >= 238 && x <= 346 && y >= 158;
const isLit = c => c[0] > 90 && c[0] > c[2] + 25;
const lit = collect(CITY, (c, x, y) => isLit(c) && !onDesk(x, y));
const litOff = lit.map(([x, y, c]) => [x, y, mix(c, [28, 32, 52], 0.8)]);
// Dark window-ish pixels next to lit ones can come on
const DARK_CANDIDATES = lit
  .map(([x, y]) => [x, y + 2])
  .filter(
    ([x, y]) =>
      y <= CITY.y1 && !isLit(rgb(base, x, y)) && lum(rgb(base, x, y)) < 40,
  );

const drawCity = (b, t) => {
  const step = Math.floor(t / 8); // changes every second
  lit.forEach(([x, y, c], i) => {
    const off = hash(i, step, 1) < 0.12;
    setPx(b, x, y, off ? litOff[i][2] : c);
  });
  DARK_CANDIDATES.forEach(([x, y], i) => {
    if (hash(i, step, 2) < 0.06) setPx(b, x, y, [164, 138, 120]);
  });
};

// Phone
// ---------------
// The glowing phone on the desk and its cyan halo: a notification lights
// it fully for a moment, then it settles back to a dimmer glow
const PHONE = { x0: 272, x1: 312, y0: 138, y1: 176 };
const isCyan = c => c[2] > c[0] + 30 && c[1] > c[0] + 20 && lum(c) > 60;
const cyan = collect(PHONE, isCyan);

const drawPhone = (b, t) => {
  // Resting at 85 percent, a buzz at two points of the loop rising to full
  const buzz = (t >= 24 && t < 36) || (t >= 72 && t < 80);
  const k = buzz ? 1 : 0.85 + 0.03 * Math.sin((t / 16) * Math.PI * 2);
  for (const [x, y, c] of cyan) setPx(b, x, y, scale(c, k));
};

// Rain
// ---------------
// Thin diagonal streaks slide down the glass over the plain sky above the
// skyline, between the window mullions. Drawn, never scaled: a streak is
// three pixels of a slightly lighter navy, stepping one down and one right
// per frame, wrapping within its pane.
const SKY = { y0: 58, y1: 110 };
const PANES = [
  { x0: 99, x1: 188 },
  { x0: 191, x1: 284 },
  { x0: 288, x1: 377 },
];
const STREAK = [74, 86, 120];
const STREAKS = Array.from({ length: 14 }, (_, i) => {
  const pane = PANES[i % PANES.length];
  return {
    pane,
    x: pane.x0 + Math.floor(hash(i, 5) * (pane.x1 - pane.x0)),
    y: SKY.y0 + Math.floor(hash(i, 6) * (SKY.y1 - SKY.y0)),
    speed: 1 + (i % 2),
  };
});

const drawRain = (b, t) => {
  for (const s of STREAKS) {
    const span = SKY.y1 - SKY.y0;
    const width = s.pane.x1 - s.pane.x0;
    const y0 = SKY.y0 + ((s.y - SKY.y0 + t * s.speed) % span);
    const x0 = s.pane.x0 + ((s.x - s.pane.x0 + t * s.speed) % width);
    for (let k = 0; k < 3; k++) {
      const x = x0 + k;
      const y = y0 + k;
      if (y > SKY.y1 || x > s.pane.x1) break;
      const bg = rgb(b, x, y);
      // Only over the dark sky and towers, never over a lit window
      if (isLit(bg) || lum(bg) > 90 || sat(bg) > 0.5) continue;
      setPx(b, x, y, mix(bg, STREAK, 0.6));
    }
  }
};

// Render
// ---------------
console.log(
  `lit ${lit.length}, candidates ${DARK_CANDIDATES.length}, cyan ${cyan.length}, streaks ${STREAKS.length}`,
);

const frames = Array.from({ length: FRAMES }, (_, t) => {
  const f = Buffer.from(plate);
  drawCity(f, t);
  drawPhone(f, t);
  drawRain(f, t);
  return f;
});

// The room a fifth smaller than drawn, see shrink.mjs, and the corner
// office another twentieth: its desk and chair came the largest
await writeLoop({
  scene,
  frames: await shrinkFrames(frames, scene.W, scene.H, {
    factor: ROOM_FACTORS.office,
  }),
  delay: DELAY,
  outDir,
  shownWidth: SHOWN_WIDTH,
  oneX: true,
});
