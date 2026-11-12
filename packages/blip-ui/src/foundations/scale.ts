/**
 * The pure side of the stage: how big a stage pixel is on a screen. The
 * stage is one pixel grid (`NATIVE`, 320 by 214 unless a game says
 * otherwise), shown at 3x wherever there is room and shrunk as a whole
 * below that. Nothing here touches the DOM, so it runs under the Node test
 * runner.
 */

/** The native size of a stage, in stage pixels */
export interface Native {
  width: number;
  height: number;
}

/** A game's usual stage: 320 by 214, shown at 3x (960 by 642) */
export const NATIVE: Native = { width: 320, height: 214 };

/**
 * Below this a screen cannot hold its words: text has a floor (14 px,
 * `fontSizeFor`) and the stage's 320 pixels don't grow, so a menu runs
 * into the small print and a list's rows wrap over each other. A window
 * that small sees the game's ask for a bigger one (`Stage`'s `small`)
 * instead; 2.25 is a window about 770 px wide.
 */
export const MIN_SCALE = 2.25;

/**
 * Held upright the stage is as wide as the phone (a scale of about 1.25)
 * and its text is set by the reader, so the floor is only what snapping
 * may take it down to
 */
export const TALL_MIN_SCALE = 1.1;

/**
 * A short window: before the stage shrinks to fit the height, up to this
 * many rows of ceiling are cropped off the top (for a screen that has
 * some to spare). The art never shrinks for height alone until the
 * ceiling is gone.
 */
export const MAX_CROP = 60;

/**
 * The scale at which the stage fits a viewport: `max` (3) wherever there
 * is room, so a game looks the same on every screen wide enough, and
 * below that whatever fraction the width (or height) allows, so it
 * shrinks with the window instead of jumping (`crispScale` then snaps it
 * to the screen's device pixels).
 */
export const scaleFor = (
  width: number,
  height: number,
  max = 3,
  native: Native = NATIVE,
): number => Math.min(max, width / native.width, height / native.height);

/**
 * The scale snapped down so that a stage pixel is a whole number of
 * device pixels: in halves on a 2x screen, in thirds on a 3x one. Then
 * nothing is ever resampled, whatever the window. A 1x screen keeps the
 * fraction (snapping there would only shrink the game), and so does a
 * scale that would fall under `min` (`MIN_SCALE`; the tall stage, which
 * sets its text by the reader, takes `TALL_MIN_SCALE`).
 *
 * Accepted: on a 1x screen a window too narrow for 3x (about 770 to 960
 * px) shows the game at a fraction, evenly soft. The whole scale under
 * it, 2, is under `MIN_SCALE`, and fitting every screen's words at 2
 * would take re-laying all of them for a window size few 1x screens use.
 */
export const crispScale = (
  scale: number,
  dpr: number,
  min = MIN_SCALE,
): number => {
  if (dpr <= 1) return scale;
  const snapped = Math.floor(scale * dpr + 1e-6) / dpr;
  return snapped >= min ? snapped : scale;
};

/**
 * The scale and the ceiling crop for a viewport: the width sets the
 * scale; when the height is short the ceiling goes first, the scale
 * after.
 */
export const fitFor = (
  width: number,
  height: number,
  max = 3,
  dpr = 1,
  native: Native = NATIVE,
  maxCrop = MAX_CROP,
): { scale: number; crop: number } => {
  const byWidth = crispScale(scaleFor(width, Infinity, max, native), dpr);
  const deficit = native.height * byWidth - height;
  if (deficit <= 0) return { scale: byWidth, crop: 0 };
  const crop = Math.min(maxCrop, Math.ceil(deficit / byWidth));
  if (crop < maxCrop) return { scale: byWidth, crop };
  return {
    scale: crispScale(
      Math.min(byWidth, height / (native.height - maxCrop)),
      dpr,
    ),
    crop: maxCrop,
  };
};

/**
 * The tall stage, for a window held upright: the full native width
 * across the window's width, at whatever scale that takes (`crispScale`
 * snaps it where it can), and as many rows as the height holds, never
 * fewer than the stage's own.
 */
export const tallFor = (
  width: number,
  height: number,
  max = 3,
  dpr = 1,
  native: Native = NATIVE,
): { scale: number; rows: number } => {
  const scale = crispScale(
    Math.min(max, width / native.width),
    dpr,
    TALL_MIN_SCALE,
  );
  return {
    scale,
    rows: Math.max(native.height, Math.floor(height / scale + 1e-6)),
  };
};

/**
 * A canvas is drawn at a whole-number scale. When the device pixels per
 * stage pixel are whole (`crisp`) that is the number, and the canvas is
 * shown at exactly its own size; else the next whole number up, never
 * under `BACKING`, scaled down a little by CSS, which is the best a
 * fraction can do. Never one under, which the browser would enlarge and
 * blur (an iPhone held upright shows a stage pixel on 3.77 of its own).
 */
export const BACKING = 3;

export const crisp = (scale: number, dpr: number): boolean => {
  const k = scale * dpr;
  return Math.abs(k - Math.round(k)) < 1e-6;
};

export const backingFor = (scale: number, dpr: number): number =>
  crisp(scale, dpr)
    ? Math.round(scale * dpr)
    : Math.max(BACKING, Math.ceil(scale * dpr));

/**
 * How far to move a box that starts at `position` (CSS pixels) so it
 * starts on a whole device pixel: to the nearest one, at most half a
 * device pixel either way. A crisp stage pixel is only crisp on screen
 * when the stage's origin is whole too; the scale is snapped
 * (`crispScale`), the position is wherever the page and its scroll put
 * it (Chrome scrolls in whole CSS pixels, which at 1.25 or 1.5 are not
 * whole device pixels).
 */
export const snapOffset = (position: number, dpr: number): number => {
  const offset = Math.round(position * dpr) / dpr - position;
  // A position already on the grid, give or take the float
  return Math.abs(offset * dpr) < 1e-3 ? 0 : offset;
};

/**
 * The overlay's font size at a scale: 16 px at 3x, never below 14 px.
 * The tall stage sets its text by the reader, not by the art: 17 px at
 * least, whatever the scale, since a phone held upright has the room.
 */
export const fontSizeFor = (scale: number, tall = false): number =>
  Math.max(tall ? 17 : 14, Math.round((16 * scale) / 3));
