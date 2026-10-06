import { articles } from '../articles';
import { caseStudies } from '../case-studies';
import { jobs } from '../jobs';
import json from '../legacy-redirects.json';
import { legacyRedirects } from '../redirects';

describe('legacy redirects', () => {
  it('keeps the JSON used by next.config in sync with the content', () => {
    const sort = (list: { source: string }[]) => [...list].sort((a, b) => a.source.localeCompare(b.source));
    expect(sort(json)).toEqual(sort(legacyRedirects));
  });

  it('never redirects the same URL twice', () => {
    const sources = legacyRedirects.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it('only points internal redirects at pages that exist', () => {
    const pages = new Set([
      ...caseStudies.map((s) => `/our-work/${s.slug}`),
      ...articles.map((a) => `/our-work/${a.slug}`),
      ...jobs.map((j) => `/jobs/${j.slug}`),
    ]);
    for (const { destination } of legacyRedirects) {
      if (destination.startsWith('http')) continue;
      expect(pages.has(destination)).toBe(true);
    }
  });

  it('never shadows a page on the new site', () => {
    const newPaths = new Set([
      ...caseStudies.map((s) => `/our-work/${s.slug}`),
      ...articles.map((a) => `/our-work/${a.slug}`),
      ...jobs.map((j) => `/jobs/${j.slug}`),
    ]);
    for (const { source } of legacyRedirects) expect(newPaths.has(source)).toBe(false);
  });

  it('uses permanent redirects only', () => {
    expect(legacyRedirects.every((r) => r.permanent)).toBe(true);
  });
});
