import { PixelIcon } from '../pixel-icon';

/** An icon next to its label: the icon is decoration, the words carry the meaning */
export function IconWithLabel() {
  return (
    <span className="inline-flex items-center gap-[calc(var(--bui-px)*2)] text-(--bui-text)">
      <PixelIcon icon="back" />
      Back
    </span>
  );
}
