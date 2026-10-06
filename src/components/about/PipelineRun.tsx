'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { prefersReducedMotion } from '@/lib/motion';

export const PIPELINE_STEPS = [
  { title: 'Lint', body: 'Shared standards enforced across TypeScript, JavaScript and React.' },
  { title: 'Unit tests', body: 'Jest, with more than 5,000 tests and coverage tracked in Codecov.' },
  { title: 'Functional tests', body: 'Puppeteer and Jest snapshots check how services respond.' },
  { title: 'Visual regression', body: 'Playwright compares page snapshots across browsers.' },
  { title: 'Deploy', body: 'Terraform and GitHub Actions ship to on-demand cloud environments.' },
];

const STEP_MS = 650;

/**
 * Byte9's release pipeline, in order (a genuine sequence, so it's numbered).
 * When it scrolls into view it runs: each stage passes in turn and a progress
 * line fills across them. Visitors can run it again.
 */
export function PipelineRun() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.4 });
  const [done, setDone] = useState(PIPELINE_STEPS.length); // server HTML: every stage passed
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const played = useRef(false);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = () => {
    clear();
    if (prefersReducedMotion()) {
      setDone(PIPELINE_STEPS.length);
      setRunning(false);
      return;
    }
    setDone(0);
    setRunning(true);
    PIPELINE_STEPS.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setDone(i + 1);
          if (i === PIPELINE_STEPS.length - 1) setRunning(false);
        }, 400 + (i + 1) * STEP_MS),
      );
    });
  };

  // Start from an unrun pipeline once JavaScript is in charge.
  useLayoutEffect(() => {
    if (!prefersReducedMotion()) setDone(0);
  }, []);

  useEffect(() => {
    if (!inView || played.current) return;
    played.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  useEffect(() => clear, []);

  const total = PIPELINE_STEPS.length;
  const status = running
    ? `Running ${PIPELINE_STEPS[done]?.title.toLowerCase() ?? 'checks'}…`
    : done === total
      ? 'All checks passed. Deployed.'
      : '';

  return (
    <div className="pipeline-run" ref={ref}>
      <div className="pipeline-run__track" aria-hidden="true">
        <span className="pipeline-run__fill" style={{ transform: `scaleX(${done / total})` }} />
      </div>
      <ol className="pipeline">
        {PIPELINE_STEPS.map((step, i) => {
          const state = i < done ? 'done' : running && i === done ? 'running' : 'idle';
          return (
            <li key={step.title} className={`pipeline__step pipeline__step--${state}`}>
              <span className="pipeline__number" aria-hidden="true">
                {state === 'done' ? (
                  <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
                    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <h3 className="pipeline__title">{step.title}</h3>
              <p className="pipeline__body">{step.body}</p>
            </li>
          );
        })}
      </ol>
      <div className="pipeline-run__footer">
        <p className="pipeline-run__status" role="status" aria-live="polite">
          {status}
        </p>
        <button type="button" className="button button--secondary button--small" onClick={run} disabled={running}>
          {running ? 'Running…' : 'Run the pipeline'}
        </button>
      </div>
    </div>
  );
}
