// `summary.md`: the measures per configuration and per task, with the number
// of runs behind each

import { MEASURES } from './aggregate.mjs';

const num = n =>
  Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));

const cell = (measure, summary) => {
  const value = summary?.measures[measure.id];
  if (!value) return '-';
  if (measure.share)
    return `${Math.round((100 * value.yes) / value.of)}% (${value.yes}/${value.of})`;
  return value.min === value.max
    ? `${num(value.median)}`
    : `${num(value.median)} (${num(value.min)} to ${num(value.max)})`;
};

/** The median, or the share, as one number, for the change against the configuration before */
const point = (measure, summary) => {
  const value = summary?.measures[measure.id];
  if (!value) return null;
  return measure.share ? value.yes / value.of : value.median;
};

const delta = (measure, now, before) => {
  const [a, b] = [point(measure, now), point(measure, before)];
  if (a === null || b === null) return '';
  const diff = a - b;
  if (diff === 0) return '0';
  const text = measure.share ? `${Math.round(diff * 100)} pp` : num(diff);
  return diff > 0 ? `+${text}` : text;
};

const table = (header, rows) =>
  [
    `| ${header.join(' | ')} |`,
    `| ${header.map((_, i) => (i === 0 ? '---' : '---:')).join(' | ')} |`,
    ...rows.map(row => `| ${row.join(' | ')} |`),
  ].join('\n');

const list = items => items.map(item => `- ${item}`).join('\n');

export const writeSummary = ({ results, comparison, writeups = [] }) => {
  const {
    label,
    collector,
    cli,
    runs,
    skipped = [],
    aggregate,
    candidates,
  } = results;
  const { configs, tasks, groups } = aggregate;
  const out = [];

  out.push(`# Blip eval: ${label}`);
  out.push(
    `Collector \`${collector.version}\`, Blip CLI \`${cli.version}\`. ${runs.length} runs, ` +
      `${runs.filter(run => run.status === 'complete').length} complete. Medians, with the ` +
      `lowest and highest of the repetitions in brackets; a share is runs of the runs it ` +
      `applies to. Layer 1 only: no \`validate\`, rendered or judged measures yet.`,
  );

  // Hand-written files beside this one, which a new collect leaves alone
  if (writeups.length)
    out.push(
      `Write-ups: ${writeups.map(name => `[\`${name}\`](${encodeURI(name)})`).join(', ')}.`,
    );

  out.push('## Runs');
  out.push(
    table(
      ['configuration', 'all', ...tasks],
      configs.map(config => [
        config,
        String(groups[config].all.runs),
        ...tasks.map(task => String(groups[config].tasks[task]?.runs ?? 0)),
      ]),
    ),
  );

  let heading = null;
  for (const measure of MEASURES) {
    if (measure.group !== heading) {
      heading = measure.group;
      out.push(`## ${heading}`);
    }
    out.push(`### ${measure.label}`);
    out.push(
      table(
        ['configuration', 'all', 'vs previous', ...tasks],
        configs.map((config, index) => [
          config,
          cell(measure, groups[config].all),
          index === 0
            ? ''
            : delta(
                measure,
                groups[config].all,
                groups[configs[index - 1]].all,
              ),
          ...tasks.map(task => cell(measure, groups[config].tasks[task])),
        ]),
      ),
    );
  }

  if (runs.some(run => run.tree.imports.invented === null)) {
    out.push(
      'Imports that are not exports were not measured in some runs: no `docs/manifest.json` in the installed package.',
    );
  }

  out.push('## Network use');
  const reached = runs.filter(run => run.transcript.network.length > 0);
  if (reached.length === 0) out.push('No run reached out.');
  else {
    out.push(
      `${reached.length} of ${runs.length} runs ran a command that reaches out. They are counted above like the others.`,
    );
    out.push(
      list(
        reached.map(
          run =>
            `\`${run.id}\`: ${run.transcript.network.map(call => `\`${call.tool}\``).join(', ')}`,
        ),
      ),
    );
  }

  const over = runs.filter(run => run.transcript.overBudget);
  const incomplete = runs.filter(run => run.status !== 'complete');
  const failed = runs.filter(run => run.transcript.failed);
  out.push('## Runs to look at');
  const notes = [
    ...over.map(
      run =>
        `\`${run.id}\`: over budget (reported as such, not as a failure of the task)`,
    ),
    ...incomplete.map(
      run =>
        `\`${run.id}\`: not a result (${run.transcript.reason}); left out of the measures`,
    ),
    ...failed.map(run => `\`${run.id}\`: the run ended in an error`),
  ];
  out.push(notes.length ? list(notes) : 'None.');

  out.push('## Skipped runs');
  out.push(
    skipped.length
      ? list(skipped.map(run => `\`${run.id}\`: ${run.reason}`))
      : 'None.',
  );

  out.push('## Candidate variants, sizes or components');
  out.push(
    'Overrides written independently in at least 3 runs across at least 2 tasks (Q11), taken from the lines the agent wrote: the restyling classes of a `className` (placing classes are left out) and the whole of an inline `style` object, keys sorted, a tuned or computed value as `*` (`gap:*`).',
  );
  if (candidates.length === 0) out.push('None.');
  else {
    out.push(
      table(
        ['on', 'classes or style', 'runs', 'tasks', 'lines'],
        candidates.map(c => [
          `\`${c.element}\`${c.kind === 'raw' ? ' (raw tag)' : ''}`,
          c.style?.length
            ? `style: ${c.style.map(x => `\`${x.replace(/\|/g, '\\|')}\``).join(' ')}`
            : c.classes.length
              ? c.classes.map(x => `\`${x}\``).join(' ')
              : '(none)',
          String(c.runs.length),
          c.tasks.join(', '),
          String(c.lines.length),
        ]),
      ),
    );
  }

  if (comparison) {
    out.push(`## Against ${comparison.label}`);
    if (comparison.refused) {
      out.push(
        `Not compared: ${comparison.refused} Collect \`${comparison.label}\` again with this collector, then compare.`,
      );
    } else {
      const header = ['measure', 'configuration', label, comparison.label];
      const rows = [];
      for (const measure of MEASURES) {
        for (const config of configs) {
          const other = comparison.aggregate.groups[config];
          if (!other) continue;
          rows.push([
            measure.label,
            config,
            cell(measure, groups[config].all),
            cell(measure, other.all),
          ]);
        }
      }
      out.push(table(header, rows));
    }
  }

  return `${out.join('\n\n')}\n`;
};
