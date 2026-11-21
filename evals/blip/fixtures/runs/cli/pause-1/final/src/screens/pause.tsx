import { Button, Window } from '@sebald/blip-ui';

export const Pause = () => (
  <Window>
    <div
      className="flex"
      style={{ position: 'absolute', inset: 0, display: 'flex', gap: 4 }}
    >
      <Button className="mt-4">Resume</Button>
    </div>
  </Window>
);
