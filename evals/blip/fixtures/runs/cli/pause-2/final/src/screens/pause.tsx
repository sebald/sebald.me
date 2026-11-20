import { Button, Window } from '@sebald/blip-ui';

export const Pause = () => (
  <Window>
    <div
      className="flex"
      style={{
        display: 'flex',
        position: 'absolute',
        inset: 0,
        gap: 'calc(var(--px) * 3)',
      }}
    >
      <Button className="mt-4 ml-2">Resume</Button>
    </div>
  </Window>
);
