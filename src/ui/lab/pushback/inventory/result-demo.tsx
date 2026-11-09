'use client';

import type { Look } from '@sebald/pushback/lib/characters';
import { ROLES, type Role } from '@sebald/pushback/lib/lines';
import { ResultScreen } from '@sebald/pushback/ui/result';
import { useMemo, useState } from 'react';

import { DemoForm, Field, ScaleSelect, Select } from './controls';
import { sampleGlossary, sampleRun } from './fixtures';

/** The end of a run, at a fixed scale, for any role and look */
export const ResultDemo = () => {
  const [role, setRole] = useState<Role>('pm');
  const [look, setLook] = useState<Look>('a');
  const [finished, setFinished] = useState(true);
  const [scale, setScale] = useState(3);
  const run = useMemo(
    () => sampleRun(role, look, finished),
    [role, look, finished],
  );
  const glossary = useMemo(() => sampleGlossary(role), [role]);
  return (
    <div className="grid gap-4">
      <DemoForm>
        <Select label="Role" value={role} options={ROLES} onChange={setRole} />
        <Select
          label="Look"
          value={look}
          options={['a', 'b'] as const}
          onChange={setLook}
        />
        <Field label="Beaten">
          <input
            type="checkbox"
            checked={finished}
            onChange={e => setFinished(e.target.checked)}
          />
        </Field>
        <ScaleSelect value={scale} scales={[2, 3]} onChange={setScale} />
      </DemoForm>
      <ResultScreen
        run={run}
        glossary={glossary}
        onBack={() => {}}
        scale={scale}
      />
    </div>
  );
};
