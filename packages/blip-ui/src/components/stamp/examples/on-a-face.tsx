import { Stamp } from '../stamp';

/** On a face, the inside darkened so the word reads */
export function OnAFace() {
  return (
    <div className="relative size-[calc(var(--px)*60)] bg-(--bui-paper)">
      <Stamp
        word="DONE"
        className="absolute bottom-[calc(var(--px)*6)] left-[calc(var(--px)*8)]"
      />
    </div>
  );
}
