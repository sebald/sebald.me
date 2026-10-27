'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { CHARACTERS, LOOKS } from '@/lib/lab/pushback/characters';
import { ROLES } from '@/lib/lab/pushback/lines';
import {
  GHOST_CELLS,
  PLAYER_SHEETS,
  type Swap,
  cellFor,
  swapKey,
} from '@/lib/lab/pushback/sprites';
import { FRAME_MS, LAYOUT, type Pose, bob } from '@/lib/lab/pushback/stage';

import { GHOST_ALPHA, drawCell } from '../draw';
import { GHOST_KEY, useSprites } from '../sheets';

const POSES: Pose[] = ['idle', 'talk', 'taunt', 'flinch', 'win', 'lose'];

interface Entry {
  key: string;
  label: string;
  swap: Swap | typeof GHOST_KEY;
}

/** The six looks, the nine colleagues, the boss and the ghost */
const ENTRIES: Entry[] = [
  ...ROLES.flatMap(role =>
    (['a', 'b'] as const).map(look => {
      const swap: Swap = { base: PLAYER_SHEETS[role][look] };
      return { key: swapKey(swap), label: LOOKS[role][look].name, swap };
    }),
  ),
  ...CHARACTERS.map(c => ({
    key: swapKey(c.swap),
    label: c.name,
    swap: c.swap,
  })),
  { key: GHOST_KEY, label: 'The ghost', swap: GHOST_KEY },
];

/**
 * Sprite viewer: every sprite the game draws, in one pose, at 1x to 4x,
 * with the swaps applied, mirrored on request, and the talk and bob
 * animation running. The contact prints are the still version of this.
 */
export const SpriteViewer = () => {
  const [pose, setPose] = useState<Pose>('idle');
  const [scale, setScale] = useState(2);
  const [mirrored, setMirrored] = useState(false);
  const [animate, setAnimate] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const swaps = useMemo(
    () => Object.fromEntries(ENTRIES.map(e => [e.key, e.swap])),
    [],
  );
  const sprites = useSprites(swaps);

  const { width: cellW, height: cellH } = LAYOUT.cell;
  const columns = 6;
  const rows = Math.ceil(ENTRIES.length / columns);
  const width = columns * cellW;
  const height = rows * cellH;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const elapsed = animate ? now - start : 0;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#2a3139';
      ctx.fillRect(0, 0, width, height);
      ENTRIES.forEach((entry, i) => {
        const sprite = sprites[entry.key];
        const x = (i % columns) * cellW;
        const bottom = (Math.floor(i / columns) + 1) * cellH;
        ctx.strokeStyle = '#4a3a3a';
        ctx.lineWidth = 1 / scale;
        ctx.strokeRect(
          x + 0.5 / scale,
          bottom - cellH + 0.5 / scale,
          cellW,
          cellH,
        );
        if (!sprite) return;
        if (entry.swap === GHOST_KEY) {
          ctx.save();
          ctx.globalAlpha = GHOST_ALPHA;
          const cell =
            pose === 'taunt'
              ? GHOST_CELLS.point
              : GHOST_CELLS.hover[Math.floor(elapsed / 600) % 2]!;
          drawCell(
            ctx,
            sprite,
            cell,
            x,
            bottom - 20 + bob(elapsed, 1200),
            mirrored,
          );
          ctx.restore();
          return;
        }
        const typing = Math.floor(elapsed / 1000) % 2 === 0;
        const cell = cellFor(pose, elapsed, typing);
        const dy = pose === 'idle' || pose === 'talk' ? bob(elapsed) : 0;
        drawCell(ctx, sprite, cell, x, bottom + dy, mirrored);
      });
      if (animate) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [sprites, pose, scale, mirrored, animate, width, height, cellW, cellH]);

  return (
    <section className="grid gap-3 font-mono text-sm">
      <h2 className="text-mist-200">Sprite viewer</h2>
      <form
        className="flex flex-wrap items-center gap-3 text-mist-300"
        onSubmit={e => e.preventDefault()}
      >
        <label className="flex items-center gap-1">
          Pose
          <select
            value={pose}
            onChange={e => setPose(e.target.value as Pose)}
            className="rounded bg-mist-900 px-1 py-0.5 text-mist-100"
          >
            {POSES.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Scale
          <select
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
            className="rounded bg-mist-900 px-1 py-0.5 text-mist-100"
          >
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={mirrored}
            onChange={e => setMirrored(e.target.checked)}
          />
          Mirrored (the right-hand side)
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={animate}
            onChange={e => setAnimate(e.target.checked)}
          />
          Animate (talk alternates every {FRAME_MS} ms while typing)
        </label>
      </form>
      <div className="overflow-x-auto">
        <canvas
          ref={canvasRef}
          width={width * scale}
          height={height * scale}
          style={{ width: width * scale, height: height * scale }}
          aria-label="Every sprite in the chosen pose"
        />
      </div>
      <ol
        className="grid grid-cols-6 gap-x-2 text-[11px] leading-tight text-mist-500"
        style={{ width: width * scale }}
      >
        {ENTRIES.map(e => (
          <li key={e.key}>{e.label}</li>
        ))}
      </ol>
    </section>
  );
};
