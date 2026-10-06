'use client';

import { useId, useState } from 'react';

interface Preset {
  label: string;
  query: string;
  variables?: string;
}

export const PRESETS: Preset[] = [
  {
    label: 'Case study results',
    query: `{
  caseStudies(featured: true) {
    client
    metrics { label value direction }
  }
}`,
  },
  {
    label: 'Open jobs',
    query: `{
  jobs { title location urgent }
}`,
  },
  {
    label: 'Search',
    query: `query Search($term: String!) {
  search(term: $term) { kind title href }
}`,
    variables: '{ "term": "GraphQL" }',
  },
  {
    label: 'What can I query?',
    query: `{
  __schema {
    queryType { fields { name description } }
  }
}`,
  },
];

type Result = { ok: boolean; status: number; ms: number; body: string } | null;

/** Sends real requests to /api/graphql and shows the response. */
export function ApiPlayground() {
  const first = PRESETS[0] as Preset;
  const [query, setQuery] = useState(first.query);
  const [variables, setVariables] = useState(first.variables ?? '');
  const [active, setActive] = useState(first.label);
  const [result, setResult] = useState<Result>(null);
  const [running, setRunning] = useState(false);
  const id = useId();

  const choose = (preset: Preset) => {
    setActive(preset.label);
    setQuery(preset.query);
    setVariables(preset.variables ?? '');
    setResult(null);
  };

  const run = async () => {
    let parsed: unknown = undefined;
    if (variables.trim()) {
      try {
        parsed = JSON.parse(variables);
      } catch {
        setResult({ ok: false, status: 0, ms: 0, body: 'Variables must be valid JSON, for example { "term": "Blaze" }' });
        return;
      }
    }
    setRunning(true);
    const started = performance.now();
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: parsed }),
      });
      const json: unknown = await response.json();
      setResult({
        ok: response.ok,
        status: response.status,
        ms: Math.round(performance.now() - started),
        body: JSON.stringify(json, null, 2),
      });
    } catch {
      setResult({ ok: false, status: 0, ms: 0, body: 'The API couldn’t be reached. Check your connection and try again.' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="playground">
      <div className="playground__presets" role="group" aria-label="Example queries">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="work-index__tab"
            aria-pressed={active === preset.label}
            onClick={() => choose(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="playground__grid">
        <div className="playground__editor">
          <label htmlFor={`${id}-query`} className="playground__label">
            Query
          </label>
          <textarea
            id={`${id}-query`}
            className="playground__code"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            spellCheck={false}
            rows={9}
          />
          <label htmlFor={`${id}-vars`} className="playground__label">
            Variables <span className="form__optional">(JSON, optional)</span>
          </label>
          <textarea
            id={`${id}-vars`}
            className="playground__code playground__code--small"
            value={variables}
            onChange={(event) => setVariables(event.target.value)}
            spellCheck={false}
            rows={2}
          />
          <button type="button" className="button button--primary" onClick={run} disabled={running}>
            {running ? 'Running…' : 'Run query'}
          </button>
        </div>
        <div className="playground__output">
          <p className="playground__label" role="status" aria-live="polite">
            {result
              ? result.status
                ? `Response: ${result.status} in ${result.ms} ms`
                : 'Not sent'
              : 'Response will appear here'}
          </p>
          <pre className={`playground__result${result && !result.ok ? ' playground__result--error' : ''}`} tabIndex={0}>
            <code>{result?.body ?? '// Choose an example or write your own, then run it.'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
