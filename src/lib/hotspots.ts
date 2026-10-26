/**
 * Hidden objects in a pixel scene, in the style of the point-and-click
 * adventures the scenes are drawn after: hovering shows the object's name,
 * clicking shows a remark about it. Written in native pixels of the scene
 * (`at: [x, y, width, height]`), so they can be read off `native.png`.
 */
export interface HotspotInput {
  name: string;
  remark: string;
  at: [x: number, y: number, width: number, height: number];
}

/** A hotspot positioned in percent of the scene, ready to render */
export interface Hotspot {
  name: string;
  remark: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

const percent = (value: number, total: number) =>
  Math.round((value / total) * 100_00) / 100;

/** Position hotspots in a scene of `width` x `height` native pixels */
export const toHotspots = (
  spots: HotspotInput[],
  { width, height }: { width: number; height: number },
): Hotspot[] =>
  spots.map(({ name, remark, at: [x, y, w, h] }) => ({
    name,
    remark,
    left: percent(x, width),
    top: percent(y, height),
    width: percent(w, width),
    height: percent(h, height),
  }));

/** Width and height of a PNG, read from its header */
export const pngSize = (data: Uint8Array) => {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
};

/**
 * The hotspot under a point given in percent of the scene. Listed first wins,
 * so smaller objects go before the larger ones they sit on.
 */
export const hotspotAt = (spots: Hotspot[], x: number, y: number) =>
  spots.find(
    s =>
      x >= s.left &&
      x <= s.left + s.width &&
      y >= s.top &&
      y <= s.top + s.height,
  );
