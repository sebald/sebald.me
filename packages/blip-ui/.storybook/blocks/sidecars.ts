import { parseSidecar } from '../../cli/build/sidecar.ts';

/**
 * Every rule sidecar, read as raw text by Vite and parsed with the pack
 * step's parser. The pack step reads the same files from disk; neither
 * depends on the other.
 */
const files = import.meta.glob<string>('../../src/**/*.blip-rules.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const sidecars = Object.entries(files).map(([file, text]) =>
  parseSidecar(text, file),
);
