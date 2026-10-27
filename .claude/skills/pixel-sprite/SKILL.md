---
name: pixel-sprite
description: Scenes and sprites for the Pushback game, in the blog's pixel-art style. In progress; package 4 added the scene pipeline (`scripts/scene.mjs` and the loop scripts under `scenes/`), package 5 adds the model-sheet prompt template, `scripts/sheet.mjs` and the review checklist.
---

# Pixel sprite (in progress)

This skill is being built alongside the Pushback game (`docs/plans/pushback.md`). So far it holds the scene pipeline: `scripts/scene.mjs` snaps a Gemini render with the pixel-header `snap.mjs` and pads it to the 480x270 stage, and each `scenes/<slug>.mjs` script animates two or three details of one scene into `scene.webp`, `scene-1x.webp` and `poster.png` under `src/assets/lab/pushback/scenes/<slug>/`, the same way the note headers are built (see the pixel-header skill, steps 4 and 5). The model-sheet prompt template, `scripts/sheet.mjs` and the sprite review checklist follow in package 5.
