/**
 * The kit's motion rule as code (`building-components.mdx`, Motion), for
 * the kit's tests and a game's: a UI element moves by a transition on
 * the kit's curves, its properties named, in 300 ms or less; art moves by
 * stepped keyframes.
 */

/** The longest a UI element's transition may take */
export const MOTION_MS = 300;

/** The kit's curves, as Tailwind classes */
export const MOTION_EASE = ['ease-bui-out', 'ease-bui-in-out'] as const;

/** A class without its variants (`tall:`, `data-settled:`) */
const utility = (token: string) => token.split(/:(?![^[(]*[\])])/).at(-1)!;

/**
 * What breaks the rule in a source's class strings: a string with a
 * transition must name its properties, take one of the kit's curves and
 * a duration within `MOTION_MS`
 */
export const transitionFaults = (source: string): string[] =>
  [...source.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g)]
    .map(match => (match[1] ?? match[2] ?? match[3]!).split(/\s+/).map(utility))
    .flatMap(utilities => {
      const transitions = utilities.filter(
        u => /^transition(?:-|$)/.test(u) && u !== 'transition-none',
      );
      if (transitions.length === 0) return [];
      const faults: string[] = [];
      for (const t of transitions)
        if (t === 'transition' || t === 'transition-all')
          faults.push(`${t}: name the properties`);
      if (!utilities.some(u => (MOTION_EASE as readonly string[]).includes(u)))
        faults.push(`${transitions.join(' ')}: on ${MOTION_EASE.join(' or ')}`);
      const ms = utilities
        .map(u => /^duration-(\d+)$/.exec(u)?.[1])
        .filter(Boolean)
        .map(Number);
      if (ms.length === 0 || ms.some(n => n > MOTION_MS))
        faults.push(
          `${transitions.join(' ')}: a duration of ${MOTION_MS} ms or under`,
        );
      return faults;
    });

/**
 * The keyframe animations in a stylesheet (`--animate-*`) that don't
 * step, by name
 */
export const glidingArt = (css: string): string[] =>
  [...css.matchAll(/--animate-([\w-]+):\s*([^;]+);/g)]
    .filter(match => !/steps\(/.test(match[2]!))
    .map(match => match[1]!);
