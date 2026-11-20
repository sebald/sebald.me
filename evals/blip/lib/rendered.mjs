// Layer 2 of the eval's judging (spec 3.5): builds and serves each run's
// result, opens the rubric's URLs wide and on a phone, and records layout
// escapes, cut text and axe violations, with a screenshot of each. Nothing is
// compared to a baseline. Uses the installed Chrome, like the game's tests.
// See `evals/blip/README.md`.

import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, normalize, resolve, sep } from 'node:path';

// The same check the Blip UI story tests run, on the game's stage
import { escapes } from '../../../packages/blip-ui/tests/visual/layout.ts';
import { collectorEnv } from './tree.mjs';

const require = createRequire(import.meta.url);

/** The stage's root: what `escapes()` measures against (the stories use `#storybook-root`) */
export const STAGE = 'section[data-slot="stage"]';

/** Wide (a desktop; under about 770 px the stage asks for a bigger window) and a phone upright, as `stories.spec.ts` */
export const VIEWPORTS = {
  wide: { width: 960, height: 600 },
  phone: { width: 402, height: 714 },
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

/** A static server for a built folder; a path without a file is the app (`index.html`) */
const serve = dist =>
  new Promise((resolvePromise, reject) => {
    const root = resolve(dist);
    const server = createServer((request, response) => {
      const path = decodeURIComponent(
        new URL(request.url ?? '/', 'http://x').pathname,
      );
      let file = normalize(join(root, path));
      if (file !== root && !file.startsWith(root + sep)) {
        response.writeHead(403).end();
        return;
      }
      if (!existsSync(file) || statSync(file).isDirectory()) {
        file = extname(path) ? '' : join(root, 'index.html');
      }
      if (!file || !existsSync(file)) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, {
        'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
      });
      createReadStream(file).pipe(response);
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () =>
      resolvePromise({
        origin: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise(done => server.close(done)),
      }),
    );
  });

const axeSource = () => readFileSync(require.resolve('axe-core'), 'utf8');

/** "tag.class by Npx" without the distance: the same fault, however far */
const faultKey = text => text.replace(/ by \d+px$/, '');

const isCut = text => text.includes('" cut by ');

const shorten = text => String(text).replace(/\s+/g, ' ').slice(0, 160);

/** One URL in one viewport. A page that does not render is recorded as such and still gets its picture */
const renderPage = async ({ context, origin, axe, root, url }) => {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(shorten(error.message)));
  const result = {
    rendered: false,
    reason: null,
    escapes: [],
    cut: [],
    axe: [],
  };
  try {
    await page.goto(`${origin}/${url}`, { timeout: 15_000 });
    try {
      // The stage's first part; not worth the wait once the page has thrown
      if (errors.length) throw new Error('page error');
      await page.locator(`${root} > *`).first().waitFor({ timeout: 5_000 });
    } catch {
      result.reason = errors.length
        ? `error: ${errors[0]}`
        : 'nothing rendered in the stage';
    }
    if (!result.reason) {
      await page.evaluate(() => document.fonts.ready);
      // Past the stage's first paint and the 300 ms transitions
      await page.waitForTimeout(500);
      const text = await page.locator(root).innerText();
      if (/No screen called/.test(text)) {
        result.reason = 'the screen is not registered';
      } else if (errors.length) {
        result.reason = `error: ${errors[0]}`;
      }
    }
    if (!result.reason) {
      result.rendered = true;
      for (const entry of await escapes(page, root)) {
        (isCut(entry) ? result.cut : result.escapes).push(entry);
      }
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(async () => {
        // @ts-expect-error injected above
        const out = await window.axe.run(document, {
          resultTypes: ['violations'],
        });
        return out.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
        }));
      });
      result.axe = violations.sort((a, b) => (a.id < b.id ? -1 : 1));
    }
  } catch (error) {
    result.rendered = false;
    result.reason = `error: ${shorten(error.message.split('\n')[0])}`;
  }
  return { result, page };
};

/**
 * Opens each URL of a built folder wide and on a phone. Screenshots go to
 * `outDir/<url id>@wide.png` and `@phone.png`; every entry of the result
 * names its file, rendered or not
 */
export const renderPages = async ({
  dist,
  urls,
  outDir,
  root = STAGE,
  browser: given = null,
}) => {
  mkdirSync(outDir, { recursive: true });
  const server = await serve(dist);
  const browser = given ?? (await launch());
  const axe = axeSource();
  const pages = [];
  // A phone is a touch device held upright, as the game's own tests open it
  const contexts = Object.fromEntries(
    await Promise.all(
      Object.entries(VIEWPORTS).map(async ([viewport, size]) => [
        viewport,
        await browser.newContext({
          viewport: size,
          deviceScaleFactor: 1,
          reducedMotion: 'reduce',
          isMobile: viewport === 'phone',
          hasTouch: viewport === 'phone',
        }),
      ]),
    ),
  );
  try {
    for (const { id, url } of urls) {
      for (const viewport of Object.keys(VIEWPORTS)) {
        const context = contexts[viewport];
        const { result, page } = await renderPage({
          context,
          origin: server.origin,
          axe,
          root,
          url,
        });
        const file = `${id}@${viewport}.png`;
        try {
          await page.screenshot({ path: join(outDir, file) });
        } catch {
          // A page that never loaded: a blank picture, so the file exists
          const empty = await context.newPage();
          await empty.screenshot({ path: join(outDir, file) });
          await empty.close();
        }
        await page.close();
        pages.push({ id, url, viewport, ...result, screenshot: file });
      }
    }
  } finally {
    await server.close();
    for (const context of Object.values(contexts)) await context.close();
    if (!given) await browser.close();
  }
  return pages;
};

/** The installed Chrome, as the game's tests (`playwright.game.config.ts`); on Linux the Playwright image's */
export const launch = () =>
  chromium.launch(process.platform === 'linux' ? {} : { channel: 'chrome' });

/** What a page holds, counted: the three of measure 4 */
export const count = pages => {
  const sum = viewport => {
    const mine = pages.filter(page => page.viewport === viewport);
    return {
      pages: mine.length,
      rendered: mine.filter(page => page.rendered).length,
      escapes: mine.reduce((n, page) => n + page.escapes.length, 0),
      cut: mine.reduce((n, page) => n + page.cut.length, 0),
      axe: mine.reduce((n, page) => n + page.axe.length, 0),
    };
  };
  return { wide: sum('wide'), phone: sum('phone') };
};

/**
 * What the untouched template shows on the same URL does not count for a
 * `changed-lines` task: faults are matched by what they are (without how far
 * they reach), axe violations by rule, taking the template's nodes off
 */
export const subtract = (pages, template) => {
  const base = new Map(
    template.map(page => [`${page.id}@${page.viewport}`, page]),
  );
  return pages.map(page => {
    const before = base.get(`${page.id}@${page.viewport}`);
    if (!before?.rendered || !page.rendered) return page;
    const off = list => {
      const budget = new Map();
      for (const entry of list)
        budget.set(faultKey(entry), (budget.get(faultKey(entry)) ?? 0) + 1);
      return entry => {
        const left = budget.get(faultKey(entry)) ?? 0;
        if (left === 0) return true;
        budget.set(faultKey(entry), left - 1);
        return false;
      };
    };
    const keepEscape = off(before.escapes);
    const keepCut = off(before.cut);
    const nodes = new Map(before.axe.map(v => [v.id, v.nodes]));
    const axe = page.axe
      .map(v => ({ ...v, nodes: v.nodes - (nodes.get(v.id) ?? 0) }))
      .filter(v => v.nodes > 0);
    const escapesNow = page.escapes.filter(keepEscape);
    const cutNow = page.cut.filter(keepCut);
    return {
      ...page,
      escapes: escapesNow,
      cut: cutNow,
      axe,
      subtracted: {
        escapes: page.escapes.length - escapesNow.length,
        cut: page.cut.length - cutNow.length,
        axe: page.axe.length - axe.length,
      },
    };
  });
};

/** `vite build` where there is no `dist` yet; false when it fails */
const ensureBuilt = cwd => {
  if (existsSync(join(cwd, 'dist', 'index.html'))) return true;
  const bin = join(cwd, 'node_modules', '.bin', 'vite');
  if (!existsSync(bin)) return false;
  return (
    spawnSync(bin, ['build'], {
      cwd,
      env: collectorEnv(),
      stdio: 'ignore',
      timeout: 5 * 60 * 1000,
    }).status === 0 && existsSync(join(cwd, 'dist', 'index.html'))
  );
};

/** The run's first commit (the template), `src/` and the project files, in a scratch folder built there */
const buildTemplate = (runDir, scratch) => {
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  const git = (args, options = {}) =>
    spawnSync('git', args, {
      cwd: runDir,
      env: collectorEnv(),
      ...options,
    });
  const root = git(['rev-list', '--max-parents=0', 'HEAD'], {
    encoding: 'utf8',
  }).stdout?.trim();
  if (!root) return false;
  const archive = git(['archive', root], { maxBuffer: 256 * 1024 * 1024 });
  if (archive.status !== 0) return false;
  const untar = spawnSync('tar', ['-x', '-C', scratch], {
    input: archive.stdout,
  });
  if (untar.status !== 0) return false;
  symlinkSync(join(runDir, 'node_modules'), join(scratch, 'node_modules'));
  return ensureBuilt(scratch);
};

const failed = (urls, reason) =>
  urls.flatMap(({ id, url }) =>
    Object.keys(VIEWPORTS).map(viewport => ({
      id,
      url,
      viewport,
      rendered: false,
      reason,
      escapes: [],
      cut: [],
      axe: [],
      screenshot: `${id}@${viewport}.png`,
    })),
  );

/**
 * Renders every run of a label. `runs` are `{ id, task, dir, scope }`, `urls`
 * the rubric's per task. Screenshots land in
 * `<labelDir>/.screenshots/<run id>/`, outside the run (a dot folder is not a
 * configuration). A run that does not build, or whose pages fail, is recorded
 * as such and the others go on. Returns `{ [run id]: rendered }`
 */
export const renderLabel = async ({
  labelDir,
  runs,
  urlsOf,
  log = () => {},
}) => {
  const browser = await launch();
  const out = {};
  const templates = new Map();
  try {
    // One baseline per task of `changed-lines`: the template, built once
    const scratch = join(labelDir, '.rendered', 'template');
    let built = null;
    const baseline = async task => {
      if (templates.has(task)) return templates.get(task);
      const run = runs.find(
        r => r.task === task && r.scope === 'changed-lines',
      );
      built ??= buildTemplate(run.dir, scratch);
      let pages = null;
      if (built) {
        pages = await renderPages({
          dist: join(scratch, 'dist'),
          urls: urlsOf(task),
          outDir: join(labelDir, '.rendered', 'template-shots', task),
          browser,
        });
      }
      templates.set(task, pages);
      return pages;
    };
    for (const run of runs) {
      const urls = urlsOf(run.task);
      const outDir = join(labelDir, '.screenshots', run.id);
      log(`rendering ${run.id}`);
      if (!ensureBuilt(run.dir)) {
        mkdirSync(outDir, { recursive: true });
        // No build to open: every URL is recorded as not rendered, each with a blank picture
        const blank = failed(urls, 'the project does not build');
        await blankShots({ browser, outDir, pages: blank });
        out[run.id] = summarise(blank, run.scope, null, run);
        continue;
      }
      let pages = await renderPages({
        dist: join(run.dir, 'dist'),
        urls,
        outDir,
        browser,
      });
      let template = null;
      if (run.scope === 'changed-lines') {
        template = await baseline(run.task);
        if (template) pages = subtract(pages, template);
      }
      out[run.id] = summarise(pages, run.scope, template, run);
    }
  } finally {
    await browser.close();
  }
  return out;
};

const blankShots = async ({ browser, outDir, pages }) => {
  for (const page of pages) {
    const context = await browser.newContext({
      viewport: VIEWPORTS[page.viewport],
    });
    await (
      await context.newPage()
    ).screenshot({
      path: join(outDir, page.screenshot),
    });
    await context.close();
  }
};

const summarise = (pages, scope, template, run) => ({
  ran: true,
  // Where the pictures are, in the label's folder
  screenshots: `.screenshots/${run.id}`,
  // Whether the untouched template was taken off (`changed-lines` only)
  subtractedTemplate: scope === 'changed-lines' ? template !== null : false,
  pages,
  totals: count(pages),
});
