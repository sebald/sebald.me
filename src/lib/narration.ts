import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * URL of a note's narration, rendered by `pnpm narrate` into
 * `public/audio/<slug>.mp3`. Undefined when the note has none (yet).
 * Pages are generated at build time, so the check runs once per build.
 */
export const narrationUrl = (slugs: string[]) => {
  const file = join('audio', `${slugs.join('/')}.mp3`);
  return existsSync(join(process.cwd(), 'public', file))
    ? `/${file}`
    : undefined;
};
