import { SpeechBubble } from '../speech-bubble';

/** Pointing up to the speaker under the bubble's tail */
export function AboveSpeaker() {
  return (
    <div className="grid w-[calc(var(--px)*160)] max-w-full justify-items-end gap-[calc(var(--px)*6)] tall:w-full">
      <div className="mr-[calc(var(--px)*6)] size-[calc(var(--px)*16)] bg-(--bui-secondary)" />
      <SpeechBubble className="w-full" offset={14}>
        Let’s take this offline.
      </SpeechBubble>
    </div>
  );
}
