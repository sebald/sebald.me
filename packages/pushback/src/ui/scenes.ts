/**
 * The four scene loops, built by `.claude/skills/pixel-sprite/scenes/*.mjs`
 * from the snapped renders. `loop1x` is the frames unscaled, for a stage
 * on whole device pixels; `loop` the big export (8x) for a fraction, which
 * the browser only ever scales down; `poster` frame 0 for reduced motion.
 */
import type { StaticImageData } from 'next/image';

import floorPoster from '../assets/scenes/floor/poster.png';
import floorLoop1x from '../assets/scenes/floor/scene-1x.webp';
import floorLoop from '../assets/scenes/floor/scene.webp';
import meetingPoster from '../assets/scenes/meeting/poster.png';
import meetingLoop1x from '../assets/scenes/meeting/scene-1x.webp';
import meetingLoop from '../assets/scenes/meeting/scene.webp';
import officePoster from '../assets/scenes/office/poster.png';
import officeLoop1x from '../assets/scenes/office/scene-1x.webp';
import officeLoop from '../assets/scenes/office/scene.webp';
import studioPoster from '../assets/scenes/studio/poster.png';
import studioLoop1x from '../assets/scenes/studio/scene-1x.webp';
import studioLoop from '../assets/scenes/studio/scene.webp';
import type { SceneId } from '../lib/characters';

export interface SceneAssets {
  loop: StaticImageData;
  loop1x: StaticImageData;
  poster: StaticImageData;
}

export const SCENE_ASSETS: Record<SceneId, SceneAssets> = {
  floor: { loop: floorLoop, loop1x: floorLoop1x, poster: floorPoster },
  meeting: { loop: meetingLoop, loop1x: meetingLoop1x, poster: meetingPoster },
  studio: { loop: studioLoop, loop1x: studioLoop1x, poster: studioPoster },
  office: { loop: officeLoop, loop1x: officeLoop1x, poster: officePoster },
};

/**
 * The loop to show: when a stage pixel is a whole number of device pixels
 * the unscaled frames, which the browser blows up with hard edges and
 * lands exactly on its pixels; else the big export, scaled down smoothly.
 */
export const loopFor = (
  assets: SceneAssets,
  crisp: boolean,
): StaticImageData => (crisp ? assets.loop1x : assets.loop);
