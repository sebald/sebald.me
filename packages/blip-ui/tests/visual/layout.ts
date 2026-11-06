import type { Page } from '@playwright/test';

/**
 * The parts of a story that show outside `#storybook-root`, the box the
 * screenshot takes: cut off in the picture, so a baseline taken of it
 * keeps the fault as the expected look. Only what is visible counts: a
 * part clipped by an ancestor (a scrolling list, a masked edge) is left
 * out up to that ancestor's edge. Each as "tag.class by Npx", the first
 * few. Text cut off inside the story counts too: by an ancestor that
 * hides its overflow (a stage too small for its words), though not by one
 * that scrolls.
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
      // A modal dialog's backdrop from Base UI: fixed over the whole
      // viewport to catch a tap outside, and it draws nothing
      if (el.matches('[data-base-ui-inert]')) continue;
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
    // Text cut off inside the story: by an ancestor that hides what
    // overflows it (a stage, a window), not one that scrolls (a list,
    // whose rail shows there is more)
    for (const node of [...root.querySelectorAll('*')].flatMap(el => [
      ...el.childNodes,
    ])) {
      if (found.length === 3) break;
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim())
        continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const text = range.getBoundingClientRect();
      if (!text.width || !text.height) continue;
      for (
        let up = node.parentElement;
        up && up !== root;
        up = up.parentElement
      ) {
        const { overflowX, overflowY } = getComputedStyle(up);
        if (![overflowX, overflowY].some(o => o === 'hidden' || o === 'clip'))
          continue;
        if ([overflowX, overflowY].some(o => o === 'auto' || o === 'scroll'))
          break;
        const clip = up.getBoundingClientRect();
        // Hidden on purpose, for assistive technology only (`sr-only`)
        if (clip.width <= 1 || clip.height <= 1) break;
        const by = Math.max(
          clip.left - text.left,
          clip.top - text.top,
          text.right - clip.right,
          text.bottom - clip.bottom,
        );
        if (by > 1) {
          found.push(
            `"${node.textContent.trim().slice(0, 30)}" cut by ${up.tagName.toLowerCase()}.${String(up.getAttribute('class') ?? '').slice(0, 40)} by ${Math.round(by)}px`,
          );
          break;
        }
      }
    }
    return found;
  });
