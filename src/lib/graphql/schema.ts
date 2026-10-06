import { buildSchema } from 'graphql';
import { articles } from '@/content/articles';
import { caseStudies } from '@/content/case-studies';
import { company } from '@/content/company';
import { jobs } from '@/content/jobs';
import type { SearchHit, WorkEntry } from '@/content/types';
import { normalise } from '@/lib/text';

/**
 * A small headless content API, shaped like the GraphQL layer in Blaze.
 * Pages query it in-process at build time (static generation) and the browser
 * queries the same schema over HTTP at /api/graphql (live search, the API demo).
 */
export const typeDefs = /* GraphQL */ `
  "A measured change after launch, in percent."
  type Metric {
    label: String!
    value: Float!
    "up or down; down is good for things like load time"
    direction: String!
  }

  type Quote {
    text: String!
    name: String!
    role: String!
  }

  type CaseStudy {
    slug: ID!
    client: String!
    title: String!
    "Publishing, Ecommerce, Public sector or Voice"
    sector: String!
    summary: String!
    challenge: String!
    solution: [String!]!
    stack: [String!]!
    outcomes: [String!]!
    metrics: [Metric!]!
    year: Int
    quote: Quote
    featured: Boolean!
    cover: String!
  }

  type ArticleSection {
    heading: String!
    body: [String!]!
  }

  type Article {
    slug: ID!
    "Insight or News"
    kind: String!
    title: String!
    summary: String!
    year: Int
    tags: [String!]!
    sections: [ArticleSection!]!
  }

  type Job {
    slug: ID!
    title: String!
    reportsTo: String!
    salary: String!
    location: String!
    summary: String!
    responsibilities: [String!]!
    skills: [String!]!
    niceToHave: [String!]!
    urgent: Boolean!
  }

  "One item on the Our work page."
  type WorkEntry {
    "Case study, Insight, News or Job"
    kind: String!
    title: String!
    summary: String!
    href: String!
    year: Int
    client: String
  }

  type SearchHit {
    kind: String!
    title: String!
    summary: String!
    href: String!
  }

  type Office {
    name: String!
    lines: [String!]!
    postcode: String!
  }

  type Company {
    name: String!
    strapline: String!
    phone: String!
    email: String!
    recruitmentEmail: String!
    offices: [Office!]!
  }

  type Query {
    caseStudies(sector: String, featured: Boolean): [CaseStudy!]!
    caseStudy(slug: ID!): CaseStudy
    articles(kind: String): [Article!]!
    article(slug: ID!): Article
    jobs: [Job!]!
    job(slug: ID!): Job
    "Everything on the Our work page, newest first within each kind."
    work(kind: String): [WorkEntry!]!
    "Keyword search across case studies, articles and jobs."
    search(term: String!): [SearchHit!]!
    company: Company!
  }
`;

export const schema = buildSchema(typeDefs);

const strip = <T extends { legacyPaths: string[] }>({ legacyPaths: _legacy, ...rest }: T) => rest;

export function workEntries(): WorkEntry[] {
  return [
    ...caseStudies.map((c) => ({
      kind: 'Case study' as const,
      title: c.title,
      summary: c.summary,
      href: `/our-work/${c.slug}`,
      year: c.year ?? null,
      client: c.client,
    })),
    ...articles.map((a) => ({
      kind: a.kind,
      title: a.title,
      summary: a.summary,
      href: `/our-work/${a.slug}`,
      year: a.year ?? null,
      client: null,
    })),
    ...jobs.map((j) => ({
      kind: 'Job' as const,
      title: j.title,
      summary: j.summary,
      href: `/jobs/${j.slug}`,
      year: null,
      client: null,
    })),
  ];
}

export function searchContent(term: string): SearchHit[] {
  const words = normalise(term).split(' ').filter((w) => w.length > 1);
  if (words.length === 0) return [];

  const documents = [
    ...caseStudies.map((c) => ({
      hit: { kind: 'Case study' as const, title: `${c.client}: ${c.title}`, summary: c.summary, href: `/our-work/${c.slug}` },
      title: normalise(`${c.client} ${c.title}`),
      body: normalise([c.summary, c.challenge, c.sector, ...c.solution, ...c.stack, ...c.outcomes].join(' ')),
    })),
    ...articles.map((a) => ({
      hit: { kind: a.kind, title: a.title, summary: a.summary, href: `/our-work/${a.slug}` },
      title: normalise(a.title),
      body: normalise([a.summary, ...a.tags, ...a.sections.flatMap((s) => [s.heading, ...s.body])].join(' ')),
    })),
    ...jobs.map((j) => ({
      hit: { kind: 'Job' as const, title: j.title, summary: j.summary, href: `/jobs/${j.slug}` },
      title: normalise(j.title),
      body: normalise([j.summary, ...j.responsibilities, ...j.skills, ...j.niceToHave].join(' ')),
    })),
  ];

  return documents
    .map((doc) => {
      let score = 0;
      for (const word of words) {
        if (doc.title.includes(word)) score += 3;
        if (doc.body.includes(word)) score += 1;
      }
      // Every word must appear somewhere for a match.
      const allPresent = words.every((w) => doc.title.includes(w) || doc.body.includes(w));
      return { hit: doc.hit, score: allPresent ? score : 0 };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.hit);
}

const byYearDesc = <T extends { year?: number | null }>(a: T, b: T) => (b.year ?? 0) - (a.year ?? 0);

export const rootValue = {
  caseStudies: ({ sector, featured }: { sector?: string | null; featured?: boolean | null }) =>
    caseStudies
      .filter((c) => (sector ? c.sector === sector : true))
      .filter((c) => (featured == null ? true : c.featured === featured))
      .map(strip),
  caseStudy: ({ slug }: { slug: string }) => {
    const found = caseStudies.find((c) => c.slug === slug);
    return found ? strip(found) : null;
  },
  articles: ({ kind }: { kind?: string | null }) =>
    articles
      .filter((a) => (kind ? a.kind === kind : true))
      .slice()
      .sort(byYearDesc)
      .map(strip),
  article: ({ slug }: { slug: string }) => {
    const found = articles.find((a) => a.slug === slug);
    return found ? strip(found) : null;
  },
  jobs: () => jobs.map(strip),
  job: ({ slug }: { slug: string }) => {
    const found = jobs.find((j) => j.slug === slug);
    return found ? strip(found) : null;
  },
  work: ({ kind }: { kind?: string | null }) => workEntries().filter((w) => (kind ? w.kind === kind : true)),
  search: ({ term }: { term: string }) => searchContent(term.slice(0, 200)),
  company: () => company,
};
