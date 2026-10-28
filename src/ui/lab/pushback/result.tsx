'use client';

import { useMemo, useState } from 'react';

import type { PairId } from '@/lib/lab/pushback/lines';
import { type RunState } from '@/lib/lab/pushback/run';
import { resultCardText } from '@/lib/lab/pushback/save';

import { Picker } from './picker';
import { Stage } from './stage';
import { useKeys } from './use-keys';
import { Window } from './window';

interface ResultScreenProps {
  run: RunState;
  /** The save's glossary, across runs */
  glossary: readonly PairId[];
  onBack: () => void;
}

export const ResultScreen = ({ run, glossary, onBack }: ResultScreenProps) => {
  const text = useMemo(() => resultCardText(run, glossary), [run, glossary]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useKeys(useMemo(() => ({ Escape: onBack }), [onBack]));

  return (
    <Stage label="Pushback, result card">
      <Stage.Center className="justify-between py-6">
        <Window>
          <pre className="m-0 text-left whitespace-pre">{text}</pre>
        </Window>
        <Picker
          label="Result card"
          className="w-full max-w-[18em]"
          items={[
            { id: 'copy', label: copied ? 'Copied' : 'Copy', onSelect: copy },
            { id: 'back', label: 'Back to the roster', onSelect: onBack },
          ]}
        />
      </Stage.Center>
    </Stage>
  );
};
