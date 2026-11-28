import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Appends one line to `.blip/events.jsonl` in the working directory (spec
 * 2.7). With `BLIP_EVENTS=off` nothing is written, not even the folder: the
 * eval's collector sets it so its own calls never mix with the agent's. A
 * log that can't be written never fails the command.
 */
export const recordEvent = (
  cwd: string,
  env: Record<string, string | undefined>,
  event: { event: string } & Record<string, unknown>,
) => {
  if (env.BLIP_EVENTS === 'off') return;
  try {
    const dir = join(cwd, '.blip');
    mkdirSync(dir, { recursive: true });
    appendFileSync(
      join(dir, 'events.jsonl'),
      `${JSON.stringify({ ts: new Date().toISOString(), ...event })}\n`,
    );
  } catch {}
};
