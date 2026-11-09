'use client';

import {
  type Look,
  MODE_ORDER,
  type Mode,
} from '@sebald/pushback/lib/characters';
import { PAIRS, ROLES, type Role } from '@sebald/pushback/lib/lines';
import {
  CARD_SIZE,
  type CardImages,
  download,
  drawResultCard,
  loadCardImages,
  resultImage,
} from '@sebald/pushback/share';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Field, Select, field } from './controls';
import { sampleGlossary, sampleRun } from './result-demo';

const GLOSSARIES = ['sample', 'full', 'empty'] as const;
type GlossaryPick = (typeof GLOSSARIES)[number];

/**
 * The result card as the picture a player saves or shares, drawn live on
 * a canvas by the package's share API for any role, look, mode and
 * outcome; the overlay outlines every part with its name, to see where
 * the layout puts it
 */
export const ResultImageDemo = () => {
  const [role, setRole] = useState<Role>('pm');
  const [look, setLook] = useState<Look>('a');
  const [finished, setFinished] = useState(true);
  const [mode, setMode] = useState<Mode>('normal');
  const [glossaryPick, setGlossaryPick] = useState<GlossaryPick>('sample');
  const [attempts, setAttempts] = useState(6);
  const [overlay, setOverlay] = useState(false);
  // The pictures with the face they were loaded for, so a stale face is
  // never drawn over another role's numbers
  const [loaded, setLoaded] = useState<{
    key: string;
    images: CardImages;
  } | null>(null);
  const key = `${role}-${look}`;
  const images = loaded?.key === key ? loaded.images : null;
  const canvas = useRef<HTMLCanvasElement>(null);

  const run = useMemo(
    () => ({ ...sampleRun(role, look, finished), mode, attempts }),
    [role, look, finished, mode, attempts],
  );
  const glossary = useMemo(
    () =>
      glossaryPick === 'full'
        ? PAIRS.map(pair => pair.id)
        : glossaryPick === 'empty'
          ? []
          : sampleGlossary(role),
    [glossaryPick, role],
  );

  // The pictures depend on the role and look only (the face's sheet)
  useEffect(() => {
    let live = true;
    loadCardImages({ role, look })
      .then(images => live && setLoaded({ key: `${role}-${look}`, images }))
      .catch(error => console.error(error));
    return () => {
      live = false;
    };
  }, [role, look]);

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx && images)
      drawResultCard(ctx, { run, glossary }, images, { overlay });
  }, [run, glossary, images, overlay]);

  const save = async () =>
    download(
      await resultImage({ run, glossary }),
      `pushback-${role}-${look}.png`,
    );

  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <Select label="Role" value={role} options={ROLES} onChange={setRole} />
        <Select
          label="Look"
          value={look}
          options={['a', 'b'] as const}
          onChange={setLook}
        />
        <Select
          label="Mode"
          value={mode}
          options={MODE_ORDER}
          onChange={setMode}
        />
        <Field label="Beaten">
          <input
            type="checkbox"
            checked={finished}
            onChange={e => setFinished(e.target.checked)}
          />
        </Field>
        <Select
          label="Glossary"
          value={glossaryPick}
          options={GLOSSARIES}
          onChange={setGlossaryPick}
        />
        {/* The verdict is picked in turn by the duels played */}
        <Field label="Duels">
          <input
            type="number"
            min={4}
            max={40}
            className={`${field.input} w-16`}
            value={attempts}
            onChange={e => setAttempts(Number(e.target.value))}
          />
        </Field>
        <Field label="Overlay">
          <input
            type="checkbox"
            checked={overlay}
            onChange={e => setOverlay(e.target.checked)}
          />
        </Field>
        <button type="button" className={field.input} onClick={save}>
          Save image
        </button>
      </form>
      <canvas
        ref={canvas}
        width={CARD_SIZE.width}
        height={CARD_SIZE.height}
        aria-label="The result card as a picture"
        className="h-auto w-full max-w-[1200px] [image-rendering:pixelated]"
      />
    </div>
  );
};
