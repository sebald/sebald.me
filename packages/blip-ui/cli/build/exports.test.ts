import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { compoundParts, parseExports } from './exports.ts';
import { buildManifest, undocumented } from './manifest.ts';

const INDEX = `
// Hooks
export { TICK_MS, prefersReducedMotion, useClock } from './hooks/use-clock';
export {
  Stage,
  type StageProps,
  Text as Words,
} from './components/stage/stage';
export { PartsContext } from './components/parts/parts';
`;

describe('parseExports', () => {
  const exports = parseExports(INDEX);

  it('reads names, aliases and kinds', () => {
    assert.deepEqual(
      exports.map(({ name, kind }) => [name, kind]),
      [
        ['TICK_MS', 'constant'],
        ['prefersReducedMotion', 'function'],
        ['useClock', 'hook'],
        ['Stage', 'component'],
        ['StageProps', 'type'],
        ['Words', 'component'],
        ['PartsContext', 'context'],
      ],
    );
    assert.equal(exports[3]!.from, 'components/stage/stage');
  });
});

describe('compoundParts', () => {
  it('finds the parts hung on a component', () => {
    const source = 'const Center = () => null;\nStage.Center = Center;\n';
    assert.deepEqual(compoundParts(source, 'Stage'), ['Stage.Center']);
    assert.deepEqual(compoundParts(source, 'Window'), []);
  });
});

describe('buildManifest', () => {
  const page = (id: string, markdown: string) => ({
    id,
    kind: 'component' as const,
    markdown,
    title: id,
    summary: '',
  });
  const manifest = buildManifest(
    '1.2.3',
    [
      page('stage', '# Stage\n\nUse `Stage` and `useClock`.'),
      page('hooks', '# Hooks\n\nIn px terms, `useClock()` ticks.'),
    ],
    [
      ...parseExports(INDEX),
      {
        name: 'Stage.Center',
        kind: 'component',
        from: 'components/stage/stage',
      },
      { name: 'px', kind: 'function', from: 'foundations/pixel' },
    ],
  );

  it('puts an export on the page of its folder, else on the page that names it', () => {
    assert.equal(manifest.exports.Stage!.page, 'stage');
    assert.equal(manifest.exports.useClock!.page, 'stage');
    assert.deepEqual(manifest.pages[0]!.exports, ['useClock', 'Stage']);
  });

  it('lists the value exports that are on no page, not types', () => {
    assert.deepEqual(undocumented(manifest), [
      'TICK_MS',
      'prefersReducedMotion',
      'Words',
      'PartsContext',
      'Stage.Center',
      'px',
    ]);
    assert.equal(manifest.exports.StageProps!.page, null);
  });

  it('counts a lowercase name only in a code span', () => {
    assert.equal(manifest.exports.px!.page, null);
  });
});
