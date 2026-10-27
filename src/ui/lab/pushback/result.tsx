'use client';

import { useMemo, useState } from 'react';

import { type RunState } from '@/lib/lab/pushback/run';
import { resultCardText } from '@/lib/lab/pushback/save';

import { Menu, Stage } from './stage';
import { useKeys } from './use-keys';

interface ResultScreenProps {
  run: RunState;
  onBack: () => void;
}

export const ResultScreen = ({ run, onBack }: ResultScreenProps) => {
  const text = useMemo(() => resultCardText(run), [run]);
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
        <pre className="rounded-xl bg-mist-900/90 px-4 py-3 text-left whitespace-pre ring-1 ring-mist-700">
          {text}
        </pre>
        <Menu
          label="Result card"
          className="w-full max-w-xs"
          items={[
            { id: 'copy', label: copied ? 'Copied' : 'Copy', onSelect: copy },
            { id: 'back', label: 'Back to the roster', onSelect: onBack },
          ]}
        />
      </Stage.Center>
    </Stage>
  );
};
