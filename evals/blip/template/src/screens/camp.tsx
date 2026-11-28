import { useEffect, useState } from 'react';

import { useGame } from '../game/state';

const THINGS = [
  {
    label: 'Look around',
    says: 'Reeds, mud and a ferry-shaped gap in the river. Smoke from Old Bess’s chimney.',
  },
  {
    label: 'Talk',
    says: 'Maud: “Can’t cross, can’t fish. If you find my ferry, I’ll owe you.”',
  },
];

export const Camp = () => {
  const game = useGame();
  const [at, setAt] = useState(0);
  const [said, setSaid] = useState('');

  // The camp listens on the window: it is the only thing on screen that takes
  // keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setAt(a => (a + 1) % THINGS.length);
      } else if (e.key === 'ArrowUp') {
        setAt(a => (a + THINGS.length - 1) % THINGS.length);
      } else if (e.key === 'Enter') {
        setSaid(THINGS[at].says);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [at]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'calc(var(--px) * 4)',
        padding: 'calc(var(--px) * 6)',
        paddingBottom: 'calc(var(--px) * 6 + var(--bui-bar))',
        background: '#2b3a1f',
        color: '#e8dcb0',
        fontFamily: 'Georgia, serif',
        fontSize: '0.85em',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderBottom: '2px solid #8a7a45',
          paddingBottom: 'calc(var(--px) * 2)',
        }}
      >
        <div
          style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#f5e6a0' }}
        >
          Camp at {game.place}
        </div>
        <div style={{ color: '#ffd24a' }}>{game.gold} gold</div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'calc(var(--px) * 2)',
        }}
      >
        {game.party.map(m => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 'calc(var(--px) * 3)',
              background: '#3a4a2a',
              padding: 'calc(var(--px) * 2) calc(var(--px) * 3)',
              border: '1px solid #55663a',
            }}
          >
            <span>
              {m.name} <span style={{ opacity: 0.7 }}>Lv {m.level}</span>
            </span>
            <span>
              HP {m.hp}/{m.maxHp} · MP {m.mp}/{m.maxMp}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'calc(var(--px) * 1)',
        }}
      >
        {THINGS.map((thing, i) => (
          <div
            key={thing.label}
            onClick={() => {
              setAt(i);
              setSaid(thing.says);
            }}
            style={{
              cursor: 'pointer',
              padding: 'calc(var(--px) * 2) calc(var(--px) * 3)',
              background: i === at ? '#8a7a45' : 'transparent',
              color: i === at ? '#1c2412' : '#e8dcb0',
            }}
          >
            {i === at ? '> ' : '  '}
            {thing.label}
          </div>
        ))}
      </div>

      <div
        style={{ fontStyle: 'italic', color: '#c9d9a0', minHeight: '2.4em' }}
      >
        {said}
      </div>
    </div>
  );
};
