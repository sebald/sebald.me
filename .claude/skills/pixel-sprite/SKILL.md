---
name: pixel-sprite
description: Scenes and sprites for the Pushback game (`/lab/pushback`) in the blog's pixel-art style. Snap a Gemini scene render to the 480x270 stage and animate it (`scripts/scene.mjs`, `scenes/*.mjs`), or cut a Gemini model sheet, item sheet or the ghost sheet into cells, keyed and palette-locked, and review the contact print (`scripts/sheet.mjs`). Use when the user drops a Pushback render into `src/assets/lab/pushback/sources/`, asks for a sheet or scene to be cut, snapped, checked or rerolled, or types `/pixel-sprite`.
---

# Pixel sprite

The art pipeline of the Pushback game. Nothing is drawn by hand: Gemini
renders the image from a prompt in `docs/plans/pushback-prompts.md`, the
scripts here pull it onto its pixel grid and into the game's formats, and
the contact prints are reviewed by eye. The spec is `docs/plans/pushback.md`
("Art and animation"); the pixel-header skill holds the shared `snap.mjs`
and `loop.mjs`.

Renders go to `src/assets/lab/pushback/sources/<id>.jpg` (recompressed,
committed) with the Gemini original in `sources/originals/` (ignored).
Everything the game imports is built from them: `scenes/<slug>/` and
`sheets/<id>.png` + `<id>.json`. Contact prints land in `sources/contact/`
(ignored).

## Sheets

One command per sheet. Run from the repo root.

```bash
# A model sheet: six poses (idle, talk, taunt, flinch, win, lose)
node .claude/skills/pixel-sprite/scripts/sheet.mjs \
  src/assets/lab/pushback/sources/dev-sam-sheet.jpg dev-sam --cells 6

# The ghost: three cells (hover, hover, point), Gemini draws it too big
node .claude/skills/pixel-sprite/scripts/sheet.mjs \
  src/assets/lab/pushback/sources/ghost-sheet.jpg ghost --cells 3 --scale 0.78

# The item sheet: eight props in 48 by 48 cells, centred, with the blurred
# figures Gemini put under the items keyed away by the wider soft key
node .claude/skills/pixel-sprite/scripts/sheet.mjs \
  src/assets/lab/pushback/sources/props-sheet.jpg props \
  --cells 8 --cell 48x48 --anchor centre --soft 90 --soft-from 0.6 --colours 48
```

What it does, in order:

1. `snap.mjs` finds the grid (11 px on a 2752 by 1536 render) and writes
   the native image.
2. The flat background is keyed by flooding from the border within
   `--tolerance` (10) of the border colour, so dark hair and outlines
   inside a figure are safe. The soft shadow under the feet is then taken
   by growing into near-background pixels (`--soft`, 40) in the lower part
   of the image only (`--soft-from`, 0.5 of the height).
3. Figures are the `--cells` largest connected groups, left to right;
   smaller groups (a flying sticky note, the steam over a cup) join the
   nearest figure, dust under `--specks` (6) pixels is dropped. A hand
   reaching into the next figure's columns is still only copied once.
4. Each figure is centred in its cell and stood on the bottom row
   (`--anchor bottom`, the feet line), or centred (`centre`, items).
5. The palette is locked to `--colours` (32) by merging the closest
   shades; the sharp that ships with Next has no quantiser.
6. Written: `sheets/<id>.png` (RGBA, cells in a row), `sheets/<id>.json`
   (cell size, count, each figure's box) and the contact print at 4x in
   `sources/contact/<id>.png`, plus `<id>-keyed.png`, the keyed render with
   the background in magenta, to see what the key took.

The console line says the figure heights and widths per cell and `CLIPPED`
when a figure does not fit its cell. `pnpm test` runs `sheets.test.ts`,
which checks every sheet's cells, the idle height (70 to 85) and the
palette.

### Review checklist

Open `sources/contact/<id>.png` and `<id>-keyed.png` and check:

- Six cells, the same person in all of them: face, hair, clothes, prop.
  A cell that drifted goes back to Gemini ("One cell drifted" follow-up).
- Height: the idle figure between 76 and 85 px; the others may differ by
  a raised prop or a bowed head, not by scale. A sheet outside the range
  is rerolled, not scaled (the ghost is the one exception, see above).
- The key: no magenta inside a figure (dark hair, black shoes), no
  leftover shadow or dust around it. Fix with `--tolerance` (lower keeps
  more), `--soft` (higher takes more shadow), `--soft-from` (where the
  soft key may start), `--specks`.
- Nothing clipped: a prop thrust past the 72 px cell is a reroll.
- Mouth and prop readable at 2x, no stray single pixels, no letters or
  brand marks (a three-pixel laptop logo is fine, a readable claw is not).
- Palette: 32 colours, the outline still one dark colour, no banding on
  the skin.

Then check the sprite in motion on the workbench (`/lab/pushback/dev`,
"Sprite viewer"): every pose, mirrored, the talk cells alternating, the
swapped colleagues with their props in the hand.

## Swaps

The nine colleagues are not drawn: `src/lib/lab/pushback/characters.ts`
gives each a `swap` (a base sheet and a prop) and the browser builds the
sprite (`src/ui/lab/pushback/sheets.ts`). Sprites keep the colours Gemini
drew; never recolour a sheet in code. Hue-based tints caught skin and
hair next to the garment and left pixels see-through, so they were taken
out. A colleague that needs its own look gets its own sheet. The prop is
pasted at the forward hand (`handAnchor` in `sprites.ts`).

## Scenes

```bash
node .claude/skills/pixel-sprite/scripts/scene.mjs \
  src/assets/lab/pushback/sources/scene-floor.jpg src/assets/lab/pushback/scenes/floor
node .claude/skills/pixel-sprite/scenes/floor.mjs \
  src/assets/lab/pushback/scenes/floor/native.png src/assets/lab/pushback/scenes/floor
```

`scene.mjs` snaps the render and pads or crops it to 480 by 270 by
repeating the plain edge rows (`pad.mjs`). Each `scenes/<slug>.mjs` then
animates two or three living details into `scene.webp` (8x, for the stage
at 1.1x and up, shown through a 320 by 134 window), `scene-1x.webp` and `poster.png`, the way the note headers
are built (pixel-header skill, steps 4 and 5). Check the result in the
workbench's scene viewer with the guides on: the stands must not overlap
furniture and the band the composition rule keeps clear must be clear.
