// Hand labels for the judge's agreement check (eval-judge's first criterion):
// which run of each task to label, the template the user fills in, and the
// comparison with what the judge said. Pure, the CLI is `evals/blip/labels.mjs`.

/**
 * The run to label for a task: of its runs (both configurations, every
 * repetition) sorted by the size of the diff of `src/`, the third smallest of
 * six. Not the smallest (barely any code to read) and not the outlier (one
 * `pause` run is twice the others), and with six tasks it lands on three runs
 * of each configuration. Ties go to the run's id.
 */
export const pickRun = sizes => {
  const sorted = [...sizes].sort(
    (a, b) => a.chars - b.chars || (a.id < b.id ? -1 : 1),
  );
  return sorted[Math.min(2, sorted.length - 1)]?.id ?? null;
};

/** What a person opens to answer a statement */
const whereToLook = (statement, { task, files, urls }) =>
  statement.from === 'screenshot'
    ? {
        screenshot: statement.screenshot,
        url: urls.find(u => u.id === statement.screenshot.split('@')[0])?.url,
      }
    : {
        diff: `node evals/blip/labels.mjs show ${task}`,
        files,
      };

/** The template a person fills in for one task: `pass` is theirs to set */
export const labelTemplate = ({ rubric, label, run, runDir, files }) => ({
  task: rubric.task,
  label,
  run,
  runFolder: runDir,
  how: 'Set each `pass` to true or false: does the claim hold for this run? Answer from what `look` names (the diff of src/ that `show` prints, or the screenshot) and nothing else. A screenshot is `<name>.png` in ~/.cache/blip-eval/<label>/.screenshots/<run>/, written by a collect that renders (or open the URL on the built app of the run). Do not open evals/blip/labels/judge/ before you are done.',
  statements: rubric.statements.map(statement => ({
    id: statement.id,
    text: statement.text,
    ...(statement.note ? { note: statement.note } : {}),
    from: statement.from,
    look: whereToLook(statement, {
      task: rubric.task,
      files,
      urls: rubric.urls,
    }),
    pass: null,
  })),
});

/**
 * Agreement of the judge with the labels. Only statements the person
 * answered (`pass` true or false) and the judge answered (pass or fail) are
 * compared; the others are counted apart
 */
export const compareLabels = (labelFiles, judgeFiles) => {
  const rows = [];
  const unlabelled = [];
  const unjudged = [];
  for (const labels of labelFiles) {
    const judge = judgeFiles.find(j => j.task === labels.task);
    for (const statement of labels.statements) {
      const key = `${labels.task}/${statement.id}`;
      if (typeof statement.pass !== 'boolean') {
        unlabelled.push(key);
        continue;
      }
      const answer = judge?.statements.find(s => s.id === statement.id);
      if (!answer || (answer.verdict !== 'pass' && answer.verdict !== 'fail')) {
        unjudged.push(
          `${key} (${answer ? answer.verdict : 'no judge answer'})`,
        );
        continue;
      }
      rows.push({
        key,
        run: labels.run,
        mine: statement.pass,
        judge: answer.verdict === 'pass',
        evidence: answer.evidence,
        agree: statement.pass === (answer.verdict === 'pass'),
      });
    }
  }
  const agreed = rows.filter(row => row.agree).length;
  return {
    compared: rows.length,
    agreed,
    share: rows.length ? agreed / rows.length : null,
    // "nine in ten": 90% of the statements that were compared
    // every statement labelled and judged, so a handful can't stand for all
    meetsCriterion:
      rows.length > 0 &&
      unlabelled.length === 0 &&
      unjudged.length === 0 &&
      agreed / rows.length >= 0.9,
    disagreements: rows.filter(row => !row.agree),
    unlabelled,
    unjudged,
  };
};
