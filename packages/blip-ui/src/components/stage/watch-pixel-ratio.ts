/**
 * Calls `onChange` whenever the device pixel ratio changes: on another
 * screen or a page zoom. A resolution query fires only once, so it is set
 * up again after each change. Returns the cleanup.
 */
export const watchPixelRatio = (onChange: () => void) => {
  let media: MediaQueryList | null = null;
  const fire = () => {
    onChange();
    watch();
  };
  const watch = () => {
    media?.removeEventListener('change', fire);
    media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    media.addEventListener('change', fire);
  };
  watch();
  return () => media?.removeEventListener('change', fire);
};
