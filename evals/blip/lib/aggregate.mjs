// Turns the runs of a label into measures per configuration and per task, and
// lists the overrides that recur (Q11)

/** The order the configurations add to one another (spec 3.4) */
export const CONFIGS = ['no-cli', 'cli', 'plan', 'hook', 'reviewer', 'full'];

export const configOrder = names =>
  [...names].sort((a, b) => {
    const [i, j] = [CONFIGS.indexOf(a), CONFIGS.indexOf(b)].map(n =>
      n < 0 ? 99 : n,
    );
    return i - j || (a < b ? -1 : a > b ? 1 : 0);
  });

const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const round = n => Number(n.toFixed(4));

/**
 * Measures of spec 3.6 that exist so far (1, 5, 6, 7). `share` ones are a
 * yes or no per run, reported as a fraction; the others as median and spread.
 * `of` picks the runs the measure is defined for
 */
export const MEASURES = [
  {
    id: 'builds',
    group: '1. It builds',
    label: 'tsc and build clean',
    share: true,
    of: run => run.tree.tsc.ran && run.tree.build.ran,
    value: run => run.tree.tsc.ok && run.tree.build.ok,
  },
  {
    id: 'tscErrors',
    group: '1. It builds',
    label: 'tsc errors left',
    of: run => run.tree.tsc.ran,
    value: run => run.tree.tsc.errors,
  },
  {
    id: 'renders',
    group: '4. It renders',
    label: 'every URL renders, wide and on a phone',
    share: true,
    of: run => run.rendered?.ran,
    value: run =>
      ['wide', 'phone'].every(
        vp =>
          run.rendered.totals[vp].rendered === run.rendered.totals[vp].pages,
      ),
  },
  ...['escapes', 'cut', 'axe'].flatMap(kind =>
    ['wide', 'phone'].map(viewport => ({
      id: `${kind}-${viewport}`,
      group: '4. It renders',
      label: `${
        { escapes: 'layout escapes', cut: 'cut text', axe: 'axe violations' }[
          kind
        ]
      }, ${viewport}`,
      of: run => run.rendered?.ran,
      value: run => run.rendered.totals[viewport][kind],
    })),
  ),
  {
    id: 'blipComponents',
    group: '5. It reuses',
    label: 'Blip components used',
    value: run => run.tree.components.blip,
  },
  {
    id: 'ownComponents',
    group: '5. It reuses',
    label: 'own components used',
    value: run => run.tree.components.own,
  },
  {
    id: 'rawControls',
    group: '5. It reuses',
    label: 'raw controls (`button`, headings, lists, inputs)',
    value: run => run.tree.rawTags.controls,
  },
  {
    id: 'rawWrappers',
    group: '5. It reuses',
    label: 'raw wrappers (`div`, `span`, ...)',
    value: run => run.tree.rawTags.wrappers,
  },
  {
    id: 'restyling',
    group: '5. It reuses',
    label: 'restyling classes',
    value: run => run.tree.classNames.restyling,
  },
  {
    id: 'placing',
    group: '5. It reuses',
    label: 'placing classes',
    value: run => run.tree.classNames.placing,
  },
  {
    id: 'invented',
    group: '5. It reuses',
    label: 'imports from Blip that are not exports',
    of: run => run.tree.imports.invented !== null,
    value: run => run.tree.imports.invented.length,
  },
  {
    id: 'lookupFirst',
    group: '6. It looks things up',
    label: 'lookup before the first `.tsx` write',
    share: true,
    of: run => run.transcript.lookupBeforeFirstTsxWrite !== null,
    value: run => run.transcript.lookupBeforeFirstTsxWrite === true,
  },
  {
    id: 'blipCalls',
    group: '6. It looks things up',
    label: '`blip` calls',
    value: run => run.transcript.blipCalls.total,
  },
  {
    id: 'readsDist',
    group: '6. It looks things up',
    label: 'reads of `dist`',
    value: run => run.transcript.reads.dist,
  },
  {
    id: 'readsDocs',
    group: '6. It looks things up',
    label: 'reads of `docs`',
    value: run => run.transcript.reads.docs,
  },
  {
    id: 'tsErrors',
    group: '6. It looks things up',
    label: 'TypeScript errors met on the way',
    value: run => run.transcript.tsErrors,
  },
  {
    id: 'toolCalls',
    group: '7. What it costs',
    label: 'tool calls',
    value: run => run.transcript.toolCalls.total,
  },
  {
    id: 'turns',
    group: '7. What it costs',
    label: 'turns',
    of: run => typeof run.transcript.turns === 'number',
    value: run => run.transcript.turns,
  },
  {
    id: 'inputTokens',
    group: '7. What it costs',
    label: 'input tokens (uncached)',
    value: run => run.transcript.tokens.input,
  },
  {
    id: 'outputTokens',
    group: '7. What it costs',
    label: 'output tokens',
    value: run => run.transcript.tokens.output,
  },
  {
    id: 'cacheTokens',
    group: '7. What it costs',
    label: 'cache tokens (read and written)',
    value: run =>
      run.transcript.tokens.cacheRead + run.transcript.tokens.cacheCreation,
  },
  {
    id: 'subagentTokens',
    group: '7. What it costs',
    label: 'subagents’ tokens (input and output)',
    value: run =>
      run.transcript.subagents.tokens.input +
      run.transcript.subagents.tokens.output,
  },
  {
    id: 'costUsd',
    group: '7. What it costs',
    label: 'dollars',
    of: run => run.transcript.costUsd !== null,
    value: run => run.transcript.costUsd,
  },
  {
    id: 'wallSeconds',
    group: '7. What it costs',
    label: 'seconds',
    of: run => run.transcript.wallSeconds !== null,
    value: run => run.transcript.wallSeconds,
  },
  {
    id: 'denials',
    group: '7. What it costs',
    label: 'permission denials',
    value: run => run.transcript.denials,
  },
  {
    id: 'overBudget',
    group: '7. What it costs',
    label: 'over budget',
    share: true,
    value: run => run.transcript.overBudget,
  },
];

const summarise = runs => {
  const measures = {};
  for (const measure of MEASURES) {
    const used = runs.filter(run => (measure.of ? measure.of(run) : true));
    if (used.length === 0) {
      measures[measure.id] = null;
      continue;
    }
    if (measure.share) {
      measures[measure.id] = {
        yes: used.filter(run => measure.value(run)).length,
        of: used.length,
      };
    } else {
      const values = used.map(run => Number(measure.value(run)));
      measures[measure.id] = {
        median: round(median(values)),
        min: round(Math.min(...values)),
        max: round(Math.max(...values)),
        n: used.length,
      };
    }
  }
  return { runs: runs.length, measures };
};

/** Per configuration: everything, and each task. Incomplete runs are not results */
export const aggregate = runs => {
  const done = runs.filter(run => run.status === 'complete');
  const configs = configOrder(new Set(done.map(run => run.config)));
  const tasks = [...new Set(done.map(run => run.task))].sort();
  const groups = {};
  for (const config of configs) {
    const mine = done.filter(run => run.config === config);
    groups[config] = {
      all: summarise(mine),
      tasks: Object.fromEntries(
        tasks
          .filter(task => mine.some(run => run.task === task))
          .map(task => [
            task,
            summarise(mine.filter(run => run.task === task)),
          ]),
      ),
    };
  }
  return { configs, tasks, groups };
};

/**
 * Overrides that recur: the same restyling classes on the same Blip
 * component (or the same raw tag and classes) in at least `minRuns` runs
 * across at least `minTasks` tasks of the label. A guess for 36 runs
 */
export const candidates = (runs, { minRuns = 3, minTasks = 2 } = {}) => {
  const groups = new Map();
  for (const run of runs) {
    if (run.status !== 'complete') continue;
    for (const override of run.tree.overrides) {
      const group = groups.get(override.key) ?? {
        key: override.key,
        kind: override.kind,
        element: override.element,
        classes: override.classes,
        style: override.style ?? [],
        runs: new Set(),
        tasks: new Set(),
        lines: [],
      };
      group.runs.add(run.id);
      group.tasks.add(run.task);
      group.lines.push(`${run.id}:${override.file}:${override.line}`);
      groups.set(override.key, group);
    }
  }
  return [...groups.values()]
    .filter(group => group.runs.size >= minRuns && group.tasks.size >= minTasks)
    .map(group => ({
      key: group.key,
      kind: group.kind,
      element: group.element,
      classes: group.classes,
      style: group.style,
      runs: [...group.runs].sort(),
      tasks: [...group.tasks].sort(),
      lines: group.lines.sort(),
    }))
    .sort((a, b) => b.runs.length - a.runs.length || (a.key < b.key ? -1 : 1));
};
