import type { Page } from '@playwright/test';

/**
 * The parts of a story that show outside `#storybook-root`, the box the
 * screenshot takes: cut off in the picture, so a baseline taken of it
 * keeps the fault as the expected look. Only what is visible counts: a
 * part clipped by an ancestor (a scrolling list, a masked edge) is left
 * out up to that ancestor's edge. Each as "tag.class by Npx", the first
 * few. Text cut off inside the story counts too: by an ancestor that
 * hides its overflow (a stage too small for its words), though not by one
 * that scrolls. `rootSelector` is the box measured against: the story by
 * default, a game's stage for the eval's rendered layer; `limit` the number
 * of faults it stops at.
 */
export const escapes = (
  page: Page,
  rootSelector = '#storybook-root',
  limit = 3,
) =>
  page.evaluate(
    ([selector, max]) => {
      const root = document.querySelector(selector);
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
        if (found.length === max) break;
      }
      // Text cut off inside the story: by an ancestor that hides what
      // overflows it (a stage, a window), not one that scrolls (a list,
      // whose rail shows there is more)
      for (const node of [...root.querySelectorAll('*')].flatMap(el => [
        ...el.childNodes,
      ])) {
        if (found.length === max) break;
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
          // A list that scrolls first: its overflow is `auto` both ways, so
          // the clipping test below would pass over it to the stage
          if ([overflowX, overflowY].some(o => o === 'auto' || o === 'scroll'))
            break;
          if (![overflowX, overflowY].some(o => o === 'hidden' || o === 'clip'))
            continue;
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
    },
    [rootSelector, limit] as const,
  );

/**
 * The focus cursor's room (`foundations/focus.mdx`): every cursor
 * (`data-slot="cursor"`, a `Picker` row's, a `Button`'s, an `IconButton`'s)
 * is 3 stage pixels from what it points at (`data-cursor-target`, or the
 * start of its host's content); nothing else that shows (another cursor's
 * target, text, a field, an icon) is closer on its side than twice that,
 * so it is plain which one it means; and the frame it sits in (a window's body, a box
 * that clips, not a list that scrolls) is no closer than the 3. Measured
 * whether the cursor shows or not, so a screen is checked for the focus it
 * can take, not the one it has. The story's own edge is `escapes`'. A
 * stage pixel is the cursor's width over 3. Each fault as "cursor of
 * <name>: …", the first few.
 */
export const cursorRoom = (
  page: Page,
  rootSelector = '#storybook-root',
  limit = 3,
) =>
  page.evaluate(
    ([selector, max]) => {
      const root = document.querySelector(selector);
      if (!root) return [];
      const shown = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && el.checkVisibility();
      };
      const cursors = [...root.querySelectorAll('[data-slot="cursor"]')].filter(
        c => c.parentElement && shown(c.parentElement),
      );
      // What a cursor points at: its target, or its host's content box
      const target = (cursor: Element) => {
        const host = cursor.parentElement!;
        const t = host.matches('[data-cursor-target]')
          ? host
          : host.querySelector('[data-cursor-target]');
        if (t) return t.getBoundingClientRect();
        const r = host.getBoundingClientRect();
        const s = getComputedStyle(host);
        const left = r.left + parseFloat(s.paddingLeft);
        const right = r.right - parseFloat(s.paddingRight);
        return new DOMRect(left, r.top, right - left, r.height);
      };
      const name = (cursor: Element) => {
        const host = cursor.closest('button') ?? cursor.parentElement!;
        return (host.getAttribute('aria-label') ?? host.textContent ?? '')
          .trim()
          .slice(0, 24);
      };
      const found: string[] = [];
      for (const cursor of cursors) {
        if (found.length === max) break;
        const c = cursor.getBoundingClientRect();
        if (!c.width) continue;
        const px = c.width / 3;
        const own = target(cursor);
        const gap = (own.left - c.right) / px;
        if (gap < 2.5 || gap > 3.5) {
          found.push(
            `cursor of "${name(cursor)}": ${gap.toFixed(1)} px from what it points at, not 3`,
          );
          continue;
        }
        // The nearest thing on the cursor's side, in its row: another
        // cursor's target, or anything else that shows (text, a field, an
        // icon), outside the control the cursor belongs to
        let near = Infinity;
        let what = '';
        const consider = (o: DOMRect, label: string) => {
          if (!o.width || !o.height) return;
          if (o.bottom <= c.top || o.top >= c.bottom) return;
          if (o.right > c.left + 0.5) return;
          if (c.left - o.right < near) {
            near = c.left - o.right;
            what = label;
          }
        };
        for (const other of cursors)
          if (other !== cursor) consider(target(other), `"${name(other)}"`);
        const control =
          cursor.closest('button, [role="option"], li') ??
          cursor.parentElement!;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim() || control.contains(node)) continue;
          const el = node.parentElement;
          if (
            !el ||
            !el.checkVisibility({
              opacityProperty: true,
              visibilityProperty: true,
            })
          )
            continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const r of range.getClientRects())
            consider(r, `"${node.textContent.trim().slice(0, 20)}"`);
        }
        for (const el of root.querySelectorAll(
          'input, textarea, select, svg, img, canvas',
        )) {
          if (control.contains(el) || el.closest('[data-slot="cursor"]'))
            continue;
          if (
            !el.checkVisibility({
              opacityProperty: true,
              visibilityProperty: true,
            })
          )
            continue;
          consider(el.getBoundingClientRect(), el.tagName.toLowerCase());
        }
        if (near / px < 2 * gap - 0.5) {
          found.push(
            `cursor of "${name(cursor)}": ${(near / px).toFixed(1)} px from ${what}, under twice its ${gap.toFixed(1)}`,
          );
          continue;
        }
        // The frame it sits in: a window's body or a box that clips, not
        // a list that scrolls (its edge draws nothing)
        for (
          let up = cursor.parentElement;
          up && up !== root;
          up = up.parentElement
        ) {
          const { overflowX } = getComputedStyle(up);
          if (
            !up.matches('[data-slot="window-body"]') &&
            overflowX !== 'hidden' &&
            overflowX !== 'clip'
          )
            continue;
          const edge = (c.left - up.getBoundingClientRect().left) / px;
          if (edge < gap - 0.5)
            found.push(
              `cursor of "${name(cursor)}": ${edge.toFixed(1)} px from the edge of its frame, under its ${gap.toFixed(1)}`,
            );
          break;
        }
      }
      return found;
    },
    [rootSelector, limit] as const,
  );

/**
 * Windows inside a window: a `Window`, a tab's panel or a dialog drawn
 * inside another. Each is a frame of its own (`data-slot="window"`), so
 * a second one in it reads as a container in a container, never a
 * screen's (`building-components.mdx`: a tab's panel and a dialog are
 * the window, their parts go straight in). Each as the inner window's
 * first words.
 */
export const windowsInWindows = (
  page: Page,
  rootSelector = '#storybook-root',
) =>
  page.evaluate(
    selector =>
      [
        ...(document
          .querySelector(selector)
          ?.querySelectorAll('[data-slot="window"] [data-slot="window"]') ??
          []),
      ].map(
        inner =>
          `a window in a window: "${(inner.textContent ?? '').trim().slice(0, 30)}"`,
      ),
    rootSelector,
  );
