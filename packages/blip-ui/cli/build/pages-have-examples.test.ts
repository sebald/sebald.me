import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const components = join(import.meta.dirname, '../../src/components');

describe('examples', () => {
  it('every component page has at least one example', () => {
    const without = readdirSync(components, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => existsSync(join(components, name, `${name}.mdx`)))
      .filter(
        name =>
          !existsSync(join(components, name, 'examples')) ||
          readdirSync(join(components, name, 'examples')).length === 0,
      );
    assert.deepEqual(without, []);
  });
});
