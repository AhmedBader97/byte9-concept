'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import type { SearchHit } from '@/content/types';

const SEARCH_QUERY = /* GraphQL */ `
  query Search($term: String!) {
    search(term: $term) { kind title summary href }
  }
`;

const SUGGESTIONS = ['GraphQL', 'Kogan Page', 'council', 'Elasticsearch', 'testing'];

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; hits: SearchHit[]; term: string }
  | { status: 'error' };

/**
 * Live search over the GraphQL API at /api/graphql.
 * Debounced, cancels stale requests and keeps the query in the URL.
 */
export function SearchClient() {
  const [term, setTerm] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });
  const inputId = useId();
  const controller = useRef<AbortController | null>(null);

  // Start from ?q= so searches can be shared.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setTerm(initial);
  }, []);

  useEffect(() => {
    const trimmed = term.trim();
    const url = new URL(window.location.href);
    if (trimmed) url.searchParams.set('q', trimmed);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);

    if (trimmed.length < 2) {
      controller.current?.abort();
      setState({ status: 'idle' });
      return;
    }

    const timeout = setTimeout(async () => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setState({ status: 'loading' });
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: SEARCH_QUERY, variables: { term: trimmed } }),
          signal: current.signal,
        });
        const json = (await response.json()) as { data?: { search: SearchHit[] }; errors?: unknown[] };
        if (!response.ok || !json.data) throw new Error('Search failed');
        setState({ status: 'done', hits: json.data.search, term: trimmed });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setState({ status: 'error' });
      }
    }, 220);

    return () => clearTimeout(timeout);
  }, [term]);

  return (
    <div>
      <form className="search-box" role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor={inputId} className="u-visually-hidden">
          Search case studies, insights and jobs
        </label>
        <input
          id={inputId}
          type="search"
          className="input"
          placeholder="Search case studies, insights and jobs"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          autoComplete="off"
          autoFocus
        />
      </form>

      <div className="search-suggestions">
        <span>Try</span>
        {SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => setTerm(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      <div className="search-results">
        <p className="search-results__status" role="status" aria-live="polite">
          {state.status === 'loading' && 'Searching…'}
          {state.status === 'error' && 'Search isn’t available right now. Browse Our work instead.'}
          {state.status === 'done' &&
            (state.hits.length === 0
              ? `No results for “${state.term}”. Try a client name, a sector or a technology.`
              : `${state.hits.length} ${state.hits.length === 1 ? 'result' : 'results'} for “${state.term}”`)}
        </p>
        {state.status === 'done' && state.hits.length > 0 && (
          <ul className="row-list">
            {state.hits.map((hit) => (
              <li key={hit.href} className="row-list__item">
                <span className="row-list__kind">
                  <span className="tag">{hit.kind}</span>
                </span>
                <span className="row-list__main">
                  <Link href={hit.href} className="row-list__link">
                    {hit.title}
                  </Link>
                  <span className="row-list__summary">{hit.summary}</span>
                </span>
                <span className="row-list__year" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
