import { BitmapText } from '../bitmap-text';

/** A result and the line under it */
export function Result() {
  return (
    <div className="grid w-fit justify-items-center gap-[calc(var(--px)*4)]">
      <BitmapText size="large">YOU WIN</BitmapText>
      <BitmapText variant="spark">FLAWLESS</BitmapText>
    </div>
  );
}
