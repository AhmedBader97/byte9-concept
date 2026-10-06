import { graphql } from 'graphql';
import { caseStudies } from '@/content/case-studies';
import { runQuery } from '../execute';
import { rootValue, schema, searchContent } from '../schema';

describe('content schema', () => {
  it('returns every case study', async () => {
    const data = await runQuery<{ caseStudies: { slug: string }[] }>('{ caseStudies { slug } }');
    expect(data.caseStudies).toHaveLength(caseStudies.length);
  });

  it('filters case studies by sector and featured flag', async () => {
    const data = await runQuery<{ caseStudies: { sector: string; featured: boolean }[] }>(
      'query ($sector: String, $featured: Boolean) { caseStudies(sector: $sector, featured: $featured) { sector featured } }',
      { sector: 'Publishing', featured: true },
    );
    expect(data.caseStudies.length).toBeGreaterThan(0);
    expect(data.caseStudies.every((c) => c.sector === 'Publishing' && c.featured)).toBe(true);
  });

  it('returns metrics with direction for a single case study', async () => {
    const data = await runQuery<{ caseStudy: { client: string; metrics: { label: string; value: number }[] } }>(
      '{ caseStudy(slug: "dockwalk") { client metrics { label value direction } } }',
    );
    expect(data.caseStudy.client).toBe('Dockwalk');
    expect(data.caseStudy.metrics[0]).toEqual({ label: 'Users', value: 817, direction: 'up' });
  });

  it('returns null for an unknown slug', async () => {
    const data = await runQuery<{ caseStudy: null }>('{ caseStudy(slug: "nope") { slug } }');
    expect(data.caseStudy).toBeNull();
  });

  it('sorts articles newest first', async () => {
    const data = await runQuery<{ articles: { year: number | null }[] }>('{ articles { year } }');
    const years = data.articles.map((a) => a.year ?? 0);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  it('does not expose internal fields such as legacy paths', async () => {
    const result = await graphql({ schema, rootValue, source: '{ caseStudies { legacyPaths } }' });
    expect(result.errors?.[0]?.message).toMatch(/Cannot query field "legacyPaths"/);
  });

  it('returns plain objects that can cross the server/client boundary', async () => {
    const data = await runQuery<{ jobs: object[] }>('{ jobs { title } }');
    expect(Object.getPrototypeOf(data.jobs[0])).toBe(Object.prototype);
  });

  it('throws a readable error for invalid queries', async () => {
    await expect(runQuery('{ notAField }')).rejects.toThrow(/GraphQL error/);
  });
});

describe('search', () => {
  it('finds case studies by client name, ignoring punctuation', () => {
    const hits = searchContent('bear bear');
    expect(hits[0]?.href).toBe('/our-work/bear-and-bear');
  });

  it('ranks title matches above body matches', () => {
    const hits = searchContent('terraform');
    expect(hits[0]?.href).toBe('/our-work/terraform-infrastructure-as-code');
  });

  it('requires every word to match', () => {
    expect(searchContent('kogan elephant')).toEqual([]);
  });

  it('includes jobs', () => {
    expect(searchContent('junior front end').some((h) => h.kind === 'Job')).toBe(true);
  });

  it('ignores very short queries', () => {
    expect(searchContent('a')).toEqual([]);
  });
});
