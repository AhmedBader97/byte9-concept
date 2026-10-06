'use client';

import Link from 'next/link';
import { useId, useMemo, useRef, useState } from 'react';
import { useFlip } from '@/hooks/useFlip';
import type { ArticleView, CaseStudyView, JobView } from '@/content/types';
import { matchesAll } from '@/lib/text';
import { CaseCard } from './CaseCard';

type Filter = 'all' | 'case-studies' | 'insights' | 'news' | 'jobs';

interface WorkIndexProps {
  studies: CaseStudyView[];
  articles: ArticleView[];
  jobs: JobView[];
}

const studyText = (s: CaseStudyView) => [s.client, s.title, s.summary, s.sector, ...s.stack].join(' ');
const articleText = (a: ArticleView) => [a.title, a.summary, ...a.tags].join(' ');
const jobText = (j: JobView) => [j.title, j.summary, ...j.skills].join(' ');

/**
 * Filterable index of everything on Our work. Filtering is instant and
 * client-side; the server renders the full list first, so it works without JS.
 */
export function WorkIndex({ studies, articles, jobs }: WorkIndexProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  // Results glide into their new places as filters change.
  useFlip(listRef, [filter, query], { duration: 420 });

  const matched = useMemo(
    () => ({
      studies: studies.filter((s) => matchesAll(studyText(s), query)),
      insights: articles.filter((a) => a.kind === 'Insight' && matchesAll(articleText(a), query)),
      news: articles.filter((a) => a.kind === 'News' && matchesAll(articleText(a), query)),
      jobs: jobs.filter((j) => matchesAll(jobText(j), query)),
    }),
    [studies, articles, jobs, query],
  );

  const tabs: { id: Filter; label: string; count: number }[] = [
    {
      id: 'all',
      label: 'All',
      count: matched.studies.length + matched.insights.length + matched.news.length + matched.jobs.length,
    },
    { id: 'case-studies', label: 'Case studies', count: matched.studies.length },
    { id: 'insights', label: 'Insights', count: matched.insights.length },
    { id: 'news', label: 'News', count: matched.news.length },
    { id: 'jobs', label: 'Jobs', count: matched.jobs.length },
  ];

  const show = (id: Filter) => filter === 'all' || filter === id;
  const total = tabs.find((t) => t.id === filter)?.count ?? 0;
  const articleRows = [...(show('insights') ? matched.insights : []), ...(show('news') ? matched.news : [])].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0),
  );

  return (
    <div className="work-index">
      <div className="work-index__controls">
        <div className="work-index__tabs" role="group" aria-label="Show">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="work-index__tab"
              aria-pressed={filter === tab.id}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
              <span className="work-index__count">{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="work-index__search">
          <label htmlFor={inputId} className="work-index__label">
            Filter by keyword
          </label>
          <input
            id={inputId}
            type="search"
            className="input"
            placeholder="Client, sector or technology"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <p className="u-visually-hidden" role="status" aria-live="polite">
        {total} {total === 1 ? 'result' : 'results'}
      </p>

      {total === 0 && (
        <div className="work-index__empty">
          <p>
            Nothing matches “{query}”. Try a client such as Kogan Page, a sector such as publishing, or a technology such as
            GraphQL.
          </p>
          <button type="button" className="button button--secondary button--small" onClick={() => setQuery('')}>
            Clear filter
          </button>
        </div>
      )}

      <div ref={listRef}>
      {show('case-studies') && matched.studies.length > 0 && (
        <section className="work-index__group" aria-labelledby={`${inputId}-studies`}>
          <h2 id={`${inputId}-studies`} className="work-index__heading">
            Case studies
          </h2>
          <div className="case-grid case-grid--three">
            {matched.studies.map((study) => (
              <div key={study.slug} data-flip={study.slug} className="work-index__item">
                <CaseCard study={study} />
              </div>
            ))}
          </div>
        </section>
      )}

      {articleRows.length > 0 && (
        <section className="work-index__group" aria-labelledby={`${inputId}-articles`}>
          <h2 id={`${inputId}-articles`} className="work-index__heading">
            {filter === 'news' ? 'News' : filter === 'insights' ? 'Insights' : 'Insights and news'}
          </h2>
          <ul className="row-list">
            {articleRows.map((article) => (
              <li key={article.slug} className="row-list__item" data-flip={article.slug}>
                <span className="row-list__kind">
                  <span className="tag">{article.kind}</span>
                </span>
                <span className="row-list__main">
                  <Link href={`/our-work/${article.slug}`} className="row-list__link">
                    {article.title}
                  </Link>
                  <span className="row-list__summary">{article.summary}</span>
                </span>
                <span className="row-list__year">{article.year ?? ''}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {show('jobs') && matched.jobs.length > 0 && (
        <section className="work-index__group" aria-labelledby={`${inputId}-jobs`}>
          <h2 id={`${inputId}-jobs`} className="work-index__heading">
            Jobs
          </h2>
          <ul className="row-list">
            {matched.jobs.map((job) => (
              <li key={job.slug} className="row-list__item" data-flip={job.slug}>
                <span className="row-list__kind">
                  <span className="tag">Job</span>
                </span>
                <span className="row-list__main">
                  <Link href={`/jobs/${job.slug}`} className="row-list__link">
                    {job.title}
                  </Link>
                  <span className="row-list__summary">{job.summary}</span>
                </span>
                <span className="row-list__year">{job.urgent ? 'Urgent' : ''}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      </div>
    </div>
  );
}
