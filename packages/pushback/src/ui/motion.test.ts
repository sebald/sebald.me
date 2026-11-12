import { glidingArt, transitionFaults } from '@sebald/blip-ui';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

/**
 * The game moves by Blip UI's rule (`building-components.mdx`, Motion):
 * its UI smoothly, by transitions on the kit's curves; its art like the
 * sprites, by stepped keyframes. These tests read the UI's sources and
 * the game's keyframes.
 */

const UI = import.meta.dirname;

/** The art that glides on purpose, and why */
const GLIDES: Record<string, string> = {
  // YOU LOSE falls: stepped on the game's frame, its in-air frames are
  // above the stage, and its gravity lands it on the stage's thud
  'call-drop': 'a fall',
};

describe('the game’s motion', () => {
  it('moves its UI smoothly: named properties, the kit’s curve, 300 ms at most', () => {
    assert.deepEqual(
      readdirSync(UI, { encoding: 'utf8' })
        .filter(file => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
        .flatMap(file =>
          transitionFaults(readFileSync(join(UI, file), 'utf8')).map(
            fault => `${file}: ${fault}`,
          ),
        ),
      [],
    );
  });

  it('moves its art like the sprites, in steps', () => {
    assert.deepEqual(
      glidingArt(readFileSync(join(UI, '../styles.css'), 'utf8')).filter(
        name => !(name in GLIDES),
      ),
      [],
    );
  });
});
