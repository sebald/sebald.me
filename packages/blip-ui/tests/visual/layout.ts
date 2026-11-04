import type { Page } from '@playwright/test';

/**
 * The parts of a story that show outside `#storybook-root`, the box the
 * screenshot takes: cut off in the picture, so a baseline taken of it
 * keeps the fault as the expected look. Only what is visible counts: a
 * part clipped by an ancestor (a scrolling list, a masked edge) is left
 * out up to that ancestor's edge. Each as "tag.class by Npx", the first
 * few.
 */
export const escapes = (page: Page) =>
  page.evaluate(() => {
    const root = document.querySelector('#storybook-root');
    if (!root) return [];
    const box = root.getBoundingClientRect();
    const found: string[] = [];
    for (const el of root.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      if (getComputedStyle(el).visibility === 'hidden') continue;
      let { left, top, right, bottom } = rect;
      for (
        let up = el.parentElement;
        up && up !== root;
        up = up.parentElement
      ) {
        if (getComputedStyle(up).overflow === 'visible') continue;
        const clip = up.getBoundingClientRect();
        left = Math.max(left, clip.left);
        top = Math.max(top, clip.top);
        right = Math.min(right, clip.right);
        bottom = Math.min(bottom, clip.bottom);
      }
      if (right <= left || bottom <= top) continue;
      const by = Math.max(
        box.left - left,
        box.top - top,
        right - box.right,
        bottom - box.bottom,
      );
      // Sub-pixel rounding at fractional scales is not a fault
      if (by > 1) {
        const name = `${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '').slice(0, 60)}`;
        found.push(`${name} by ${Math.round(by)}px`);
      }
      if (found.length === 3) break;
    }
    return found;
  });
