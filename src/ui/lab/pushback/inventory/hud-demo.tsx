'use client';

import { useState } from 'react';

import { LAYOUT, STAGE } from '@/lib/lab/pushback/stage';

import { Hud } from '../hud';
import { Pixels } from '../stage';
import { Field, field } from './controls';

/** The bars with every number on a control, over a flat band */
export const HudDemo = () => {
  const [scale, setScale] = useState(1);
  const [player, setPlayer] = useState(1);
  const [opponent, setOpponent] = useState(2);
  const [crop, setCrop] = useState(0);
  const [boss, setBoss] = useState(false);
  const [still, setStill] = useState(false);
  const toWin = boss ? 4 : 3;
  const toLose = boss ? 3 : 3;
  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <Field label={`Scale ${scale}`}>
          <input
            type="range"
            min={-toLose}
            max={toWin}
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
          />
        </Field>
        <Field label={`Momentum ${player}`}>
          <input
            type="range"
            min={0}
            max={2}
            value={player}
            onChange={e => setPlayer(Number(e.target.value))}
          />
        </Field>
        <Field label={`Theirs ${opponent}`}>
          <input
            type="range"
            min={0}
            max={2}
            value={opponent}
            onChange={e => setOpponent(Number(e.target.value))}
          />
        </Field>
        <Field label={`Crop ${crop}`}>
          <input
            type="range"
            min={0}
            max={60}
            step={10}
            value={crop}
            onChange={e => setCrop(Number(e.target.value))}
          />
        </Field>
        <Field label="Boss reach">
          <input
            type="checkbox"
            checked={boss}
            onChange={e => setBoss(e.target.checked)}
          />
        </Field>
        <Field label="Still">
          <input
            type="checkbox"
            checked={still}
            onChange={e => setStill(e.target.checked)}
          />
        </Field>
      </form>
      <Pixels scale={3}>
        <div
          className="relative overflow-hidden bg-(--pb-wall)"
          style={{
            width: `calc(var(--px) * ${STAGE.width})`,
            height: `calc(var(--px) * ${LAYOUT.hud + 60})`,
          }}
        >
          <Hud
            scale={scale}
            toWin={toWin}
            toLose={toLose}
            momentum={{ player, opponent }}
            momentumTotal={2}
            names={{ player: 'Jo', opponent: 'The Junior' }}
            crop={crop}
            still={still}
          />
        </div>
      </Pixels>
    </div>
  );
};
