'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { highlightJson } from '@/lib/highlight';
import { prefersReducedMotion } from '@/lib/motion';

interface LiveQueryProps {
  query: string;
  /** Response lines rendered on the server, shown in full without JavaScript */
  initialLines: string[];
  /** Shape the live response the same way the server-rendered one was trimmed */
  trim?: 'publishing';
}

type Phase = 'idle' | 'typing' | 'waiting' | 'streaming' | 'done';

const TYPE_MS = 14;
const LINE_MS = 34;

function trimResponse(json: { data?: { caseStudies?: { client: string; metrics: unknown[] }[] } }) {
  const studies = json.data?.caseStudies ?? [];
  return {
    data: {
      caseStudies: [
        ...studies.filter((c) => c.metrics.length > 0),
        ...studies.filter((c) => c.metrics.length === 0).slice(0, 1),
      ].map((c) => ({ ...c, metrics: c.metrics.slice(0, 2) })),
    },
  };
}

/**
 * The GraphQL panel on the Blaze page. When it scrolls into view the query
 * types itself and the response streams in line by line. "Run again" sends a
 * real request to /api/graphql and reports the round-trip time.
 */
export function LiveQuery({ query, initialLines, trim }: LiveQueryProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.35 });
  const [lines, setLines] = useState(initialLines);
  const [typed, setTyped] = useState(query.length);
  const [shown, setShown] = useState(initialLines.length);
  const [phase, setPhase] = useState<Phase>('done');
  const [timing, setTiming] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const played = useRef(false);
  // Server HTML holds the full response; CSS keeps it hidden until we take over, so there's no flash.
  const [motionReady, setMotionReady] = useState(false);

  useLayoutEffect(() => {
    if (!prefersReducedMotion()) {
      setTyped(0);
      setShown(0);
    }
    setMotionReady(true);
  }, []);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const stream = useCallback((next: string[]) => {
    setLines(next);
    setShown(0);
    setPhase('streaming');
    next.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setShown(i + 1);
          if (i === next.length - 1) setPhase('done');
        }, (i + 1) * LINE_MS),
      );
    });
  }, []);

  const play = useCallback(
    (response: string[]) => {
      clear();
      setTyped(0);
      setShown(0);
      setPhase('typing');
      for (let i = 1; i <= query.length; i++) {
        timers.current.push(setTimeout(() => setTyped(i), i * TYPE_MS));
      }
      timers.current.push(setTimeout(() => stream(response), query.length * TYPE_MS + 260));
    },
    [query, stream],
  );

  // First appearance: replay the server-rendered response with motion.
  useEffect(() => {
    if (!inView || played.current || prefersReducedMotion()) return;
    played.current = true;
    play(initialLines);
  }, [inView, play, initialLines]);

  useEffect(() => clear, []);

  const runAgain = async () => {
    clear();
    setPhase('waiting');
    setTiming(null);
    const started = performance.now();
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const json = await response.json();
      const shaped = trim === 'publishing' ? trimResponse(json) : json;
      setTiming(`${response.status} in ${Math.round(performance.now() - started)} ms`);
      const next = JSON.stringify(shaped, null, 2).split('\n');
      if (prefersReducedMotion()) {
        setLines(next);
        setShown(next.length);
        setPhase('done');
      } else {
        stream(next);
      }
    } catch {
      setTiming('The API couldn’t be reached');
      setPhase('done');
      setShown(lines.length);
    }
  };

  const typing = phase === 'typing';
  // Reserve the finished size up front, so typing and streaming never move the layout
  const rows = (n: number) => ({ '--rows': n }) as React.CSSProperties;

  return (
    <figure className="code" ref={ref} data-motion={motionReady ? 'ready' : 'pending'}>
      <div className="code__pane">
        <p className="code__label">POST /api/graphql</p>
        <pre className="code__pre" style={rows(query.split('\n').length)}>
          <code>
            {query.slice(0, typed)}
            {typing && <span className="code__caret" aria-hidden="true" />}
          </code>
        </pre>
      </div>
      <div className="code__pane code__pane--response">
        <p className="code__label">
          Response
          {phase === 'waiting' && <span className="code__status"> sending…</span>}
          {timing && phase !== 'waiting' && <span className="code__status"> {timing}</span>}
        </p>
        <pre className="code__pre" aria-live="off" style={rows(lines.length)}>
          <code>
            {lines.slice(0, shown).map((line, i) => (
              <span key={i} className="code__line">
                {highlightJson(line, i)}
              </span>
            ))}
          </code>
        </pre>
      </div>
      <figcaption className="code__caption">
        <span>A real request to this site’s GraphQL API.</span>
        <button type="button" className="code__run" onClick={runAgain} disabled={phase === 'typing' || phase === 'waiting'}>
          Run it again
        </button>
      </figcaption>
    </figure>
  );
}
