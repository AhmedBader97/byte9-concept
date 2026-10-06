import { archive } from '../archive';
import { articles } from '../articles';
import { caseStudies } from '../case-studies';
import { clients, company } from '../company';
import { jobs } from '../jobs';

describe('content integrity', () => {
  it('uses unique slugs across the /our-work namespace', () => {
    const slugs = [...caseStudies, ...articles].map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('uses URL-safe slugs', () => {
    for (const entry of [...caseStudies, ...articles, ...jobs]) {
      expect(entry.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('gives every case study the copy a page needs', () => {
    for (const study of caseStudies) {
      expect(study.client.trim()).not.toBe('');
      expect(study.summary.length).toBeGreaterThan(40);
      expect(study.challenge.length).toBeGreaterThan(40);
      expect(study.solution.length).toBeGreaterThanOrEqual(3);
      expect(study.stack.length).toBeGreaterThan(0);
      expect(study.outcomes.length).toBeGreaterThan(0);
    }
  });

  it('only records positive percentage changes with a direction', () => {
    for (const metric of caseStudies.flatMap((s) => s.metrics)) {
      expect(metric.value).toBeGreaterThan(0);
      expect(['up', 'down']).toContain(metric.direction);
    }
  });

  it('keeps quotes short enough to be fair use', () => {
    for (const quote of caseStudies.flatMap((s) => (s.quote ? [s.quote] : []))) {
      expect(quote.text.split(/\s+/).length).toBeLessThan(15);
    }
  });

  it('features enough case studies for the homepage grid', () => {
    expect(caseStudies.filter((s) => s.featured).length).toBeGreaterThanOrEqual(5);
  });

  it('gives every article at least one section with body copy', () => {
    for (const article of articles) {
      expect(article.sections.length).toBeGreaterThan(0);
      for (const section of article.sections) expect(section.body.length).toBeGreaterThan(0);
    }
  });

  it('lists every job with responsibilities and skills', () => {
    expect(jobs).toHaveLength(5);
    for (const job of jobs) {
      expect(job.responsibilities.length).toBeGreaterThan(0);
      expect(job.skills.length).toBeGreaterThan(0);
    }
  });

  it('links every archive item to the original site', () => {
    const urls = archive.map((item) => item.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) expect(url).toMatch(/^https:\/\/www\.thebyte9\.com\//);
  });

  it('has both offices and the main contact details', () => {
    expect(company.offices.map((o) => o.name)).toEqual(['London', 'Reading']);
    expect(company.email).toBe('hello@thebyte9.com');
    expect(company.phoneHref).toMatch(/^tel:\+44/);
    expect(clients).toContain('Kogan Page');
  });
});
