import type { ReactNode } from 'react';

import {
  KINDS,
  type Rule as RuleData,
  flags,
  sortRules,
} from '../../cli/rules.ts';
import { sidecars } from './sidecars.ts';

const muted = { opacity: 0.7 } as const;

/** One rule: its id and sentence, what marks it, its fix and its source */
const RuleItem = ({ rule }: { rule: RuleData }) => (
  <li id={rule.id} style={{ margin: '0.5em 0' }}>
    <code>{rule.id}</code> {rule.text}
    {flags(rule) && <span style={muted}> {flags(rule)}</span>}
    {rule.check && (
      <span style={muted}>
        {' '}
        checked by <code>{rule.check}</code>
      </span>
    )}
    {rule.fix && (
      <details>
        <summary>Fix</summary>
        <pre>
          <code>{rule.fix}</code>
        </pre>
      </details>
    )}
    {rule.source && (
      <div style={muted}>
        <a href={rule.source}>Source</a>
      </div>
    )}
  </li>
);

const Group = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <h3>{label}</h3>
    <ul style={{ paddingLeft: '1.25em' }}>{children}</ul>
  </>
);

/**
 * All the rules of a page, by kind, then when not to use it. An open
 * question is shown too, marked `[open]`: here is where it is reviewed.
 */
export const Rules = ({ for: page }: { for: string }) => {
  const sidecar = sidecars.find(sidecar => sidecar.page === page);
  if (!sidecar) throw new Error(`<Rules for="${page}" />: no sidecar for it`);
  const rules = sortRules(sidecar.rules);
  return (
    <div data-rules={page}>
      {KINDS.map(([kind, label]) => {
        const ofKind = rules.filter(rule => rule.kind === kind);
        return ofKind.length === 0 ? null : (
          <Group key={kind} label={label}>
            {ofKind.map(rule => (
              <RuleItem key={rule.id} rule={rule} />
            ))}
          </Group>
        );
      })}
      {sidecar.whenNot.length > 0 && (
        <Group label="When not">
          {sidecar.whenNot.map(entry => (
            <li key={entry.text} style={{ margin: '0.5em 0' }}>
              {entry.text} <code>blip docs {entry.use}</code>
            </li>
          ))}
        </Group>
      )}
    </div>
  );
};

/** One rule, inline in a sentence */
export const Rule = ({ id }: { id: string }) => {
  const rule = sidecars
    .flatMap(sidecar => sidecar.rules)
    .find(rule => rule.id === id);
  if (!rule) throw new Error(`<Rule id="${id}" />: no such rule`);
  return (
    <span data-rule={id}>
      <code>{rule.id}</code> {rule.text}
      {flags(rule) && <span style={muted}> {flags(rule)}</span>}
    </span>
  );
};
