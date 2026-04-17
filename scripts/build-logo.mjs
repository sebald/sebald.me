#!/usr/bin/env node
// Reads the Game Boy dither source SVG and emits a compact 4-color SVG at:
//   - src/app/icon.svg   (Next.js favicon)
//   - public/logo.svg    (static asset served at /logo.svg for the Logo component)
// Both files have identical content; they exist at two paths because Next.js
// reserves src/app/icon.svg for the favicon convention and does not serve it
// from a stable public URL.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src/dither-2026-04-17-ph7qrh.svg');

// Map Game Boy → mist (OKLCH values from src/css/theme.css)
const COLOR_MAP = {
  '#0f380f': 'oklch(.19 .02 268)', // mist-900
  '#306230': 'oklch(.31 .03 265)', // mist-700
  '#8bac0f': 'oklch(.6 .04 250)',  // mist-400
};
const BG_OUT = 'oklch(.94 .01 233)'; // mist-100
const GRID = 256;
const CELL = 8;

function parse(svg) {
  const groups = {};
  const groupRe = /<g fill="(#[0-9a-fA-F]+)"[^>]*>([\s\S]*?)<\/g>/g;
  let m;
  while ((m = groupRe.exec(svg)) !== null) {
    const fill = m[1].toLowerCase();
    const rects = [];
    const rectRe = /<rect x="(\d+)" y="(\d+)" width="8" height="8"\/>/g;
    let r;
    while ((r = rectRe.exec(m[2])) !== null) {
      rects.push([+r[1] / CELL, +r[2] / CELL]);
    }
    groups[fill] = rects;
  }
  return groups;
}

function rectCover(cells) {
  const grid = new Map();
  for (const [x, y] of cells) {
    if (!grid.has(y)) grid.set(y, new Set());
    grid.get(y).add(x);
  }
  const rowRuns = new Map();
  const ys = [...grid.keys()].sort((a, b) => a - b);
  for (const y of ys) {
    const xs = [...grid.get(y)].sort((a, b) => a - b);
    const runs = [];
    let i = 0;
    while (i < xs.length) {
      let j = i;
      while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
      runs.push([xs[i], xs[j] - xs[i] + 1]);
      i = j + 1;
    }
    rowRuns.set(y, runs);
  }
  const used = new Map();
  const out = [];
  for (const y of ys) {
    const runs = rowRuns.get(y);
    for (let ri = 0; ri < runs.length; ri++) {
      if (used.get(y)?.has(ri)) continue;
      const [x, w] = runs[ri];
      let h = 1;
      let yy = y + 1;
      while (rowRuns.has(yy)) {
        const nextRuns = rowRuns.get(yy);
        const idx = nextRuns.findIndex(([nx, nw]) => nx === x && nw === w);
        if (idx === -1) break;
        if (used.get(yy)?.has(idx)) break;
        if (!used.has(yy)) used.set(yy, new Set());
        used.get(yy).add(idx);
        h++;
        yy++;
      }
      out.push([x, y, w, h]);
    }
  }
  return out;
}

// Build `d` using absolute moves + horizontal/vertical shorthand, sorted by
// (y, x) so consecutive rects cluster. Drop trailing `z` — fill still closes
// each subpath implicitly under the non-zero fill rule.
function rectsToPath(rects) {
  rects.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const parts = [];
  for (const [x, y, w, h] of rects) {
    // Single-cell shortcut saves a few chars.
    if (w === 1 && h === 1) parts.push(`M${x} ${y}h1v1h-1`);
    else parts.push(`M${x} ${y}h${w}v${h}h-${w}`);
  }
  return parts.join('');
}

function main() {
  const svg = readFileSync(SRC, 'utf8');
  const groups = parse(svg);

  const colorData = [];
  let totalIn = 0;
  let totalOut = 0;
  for (const [fill, oklch] of Object.entries(COLOR_MAP)) {
    const cells = groups[fill] || [];
    totalIn += cells.length;
    const rects = rectCover(cells);
    totalOut += rects.length;
    colorData.push({ oklch, d: rectsToPath(rects), count: rects.length });
    console.log(`  ${fill}: ${cells.length} cells → ${rects.length} rects`);
  }
  console.log(`  total: ${totalIn} → ${totalOut} rects`);

  const r = GRID / 2;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID} ${GRID}" shape-rendering="crispEdges">`,
    `<defs><clipPath id="c"><circle cx="${r}" cy="${r}" r="${r}"/></clipPath></defs>`,
    `<g clip-path="url(#c)">`,
    `<path fill="${BG_OUT}" d="M0 0h${GRID}v${GRID}h-${GRID}"/>`,
    ...colorData.map(({ oklch, d }) => `<path fill="${oklch}" d="${d}"/>`),
    `</g>`,
    `</svg>`,
  ];
  const out = parts.join('') + '\n';

  for (const rel of ['src/app/icon.svg', 'public/logo.svg']) {
    const p = join(ROOT, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, out);
    console.log(`wrote ${p} (${(out.length / 1024).toFixed(1)} KB)`);
  }
}

main();
