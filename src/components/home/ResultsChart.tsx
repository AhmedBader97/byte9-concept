'use client';

import { useRef } from 'react';
import { CountUp } from '@/components/motion/CountUp';
import { useInView } from '@/hooks/useInView';

export interface ResultRow {
  client: string;
  label: string;
  value: number;
  direction: 'up' | 'down';
  href: string;
}

export interface ResultPanel {
  title: string;
  rows: ResultRow[];
}

/**
 * Horizontal bar chart built as a real table, so the numbers are readable by
 * screen readers and the chart degrades to a table without CSS. Each panel
 * has its own scale (small multiples), never a shared dual axis.
 *
 * When the chart scrolls into view, bars grow from the baseline in sequence and
 * the figures count up. The server renders the final state for no-JS readers.
 */
function Panel({ panel }: { panel: ResultPanel }) {
  const titleId = `results-${panel.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const max = Math.max(...panel.rows.map((r) => r.value));
  return (
    <figure className="results__panel">
      <figcaption id={titleId} className="results__title">
        {panel.title}
      </figcaption>
      <table className="results__table" aria-labelledby={titleId}>
        <thead className="u-visually-hidden">
          <tr>
            <th scope="col">Client and measure</th>
            <th scope="col">Change after launch</th>
          </tr>
        </thead>
        <tbody>
          {panel.rows.map((row, i) => (
            <tr
              className="results__row"
              key={`${row.client}-${row.label}`}
              style={{ '--row': i } as React.CSSProperties}
            >
              <th scope="row" className="results__label">
                <a href={row.href} className="results__client">
                  {row.client}
                </a>
                <span className="results__measure">{row.label}</span>
              </th>
              <td className="results__cell">
                <span className="results__meter">
                  <span className="results__track" aria-hidden="true">
                    <span className="results__bar" style={{ inlineSize: `${Math.max(2, (row.value / max) * 100)}%` }} />
                  </span>
                  <CountUp
                    className="results__value"
                    value={row.value}
                    prefix={row.direction === 'down' ? '−' : '+'}
                    suffix="%"
                    delay={120 + i * 90}
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function ResultsChart({ panels }: { panels: ResultPanel[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.25 });
  return (
    <div className="results" ref={ref} data-inview={inView ? 'true' : 'false'}>
      {panels.map((panel) => (
        <Panel panel={panel} key={panel.title} />
      ))}
    </div>
  );
}
