import type { ArticleView, CaseStudyView, Company, JobView, WorkEntry } from '@/content/types';
import { runQuery } from './graphql/execute';

/**
 * Typed data access for pages. Every function is a GraphQL query, so pages
 * consume content exactly as they would from a headless CMS.
 */

const CASE_STUDY = /* GraphQL */ `
  fragment CaseStudyFields on CaseStudy {
    slug client title sector summary challenge solution stack outcomes year featured cover
    metrics { label value direction }
    quote { text name role }
  }
`;

const ARTICLE = /* GraphQL */ `
  fragment ArticleFields on Article {
    slug kind title summary year tags
    sections { heading body }
  }
`;

const JOB = /* GraphQL */ `
  fragment JobFields on Job {
    slug title reportsTo salary location summary responsibilities skills niceToHave urgent
  }
`;

export async function getCaseStudies(filter: { featured?: boolean; sector?: string } = {}) {
  const data = await runQuery<{ caseStudies: CaseStudyView[] }>(
    `${CASE_STUDY}
     query CaseStudies($featured: Boolean, $sector: String) {
       caseStudies(featured: $featured, sector: $sector) { ...CaseStudyFields }
     }`,
    filter,
  );
  return data.caseStudies;
}

export async function getCaseStudy(slug: string) {
  const data = await runQuery<{ caseStudy: CaseStudyView | null }>(
    `${CASE_STUDY}
     query CaseStudy($slug: ID!) { caseStudy(slug: $slug) { ...CaseStudyFields } }`,
    { slug },
  );
  return data.caseStudy;
}

export async function getArticles(kind?: 'Insight' | 'News') {
  const data = await runQuery<{ articles: ArticleView[] }>(
    `${ARTICLE}
     query Articles($kind: String) { articles(kind: $kind) { ...ArticleFields } }`,
    { kind },
  );
  return data.articles;
}

export async function getArticle(slug: string) {
  const data = await runQuery<{ article: ArticleView | null }>(
    `${ARTICLE}
     query Article($slug: ID!) { article(slug: $slug) { ...ArticleFields } }`,
    { slug },
  );
  return data.article;
}

export async function getJobs() {
  const data = await runQuery<{ jobs: JobView[] }>(`${JOB} query Jobs { jobs { ...JobFields } }`);
  return data.jobs;
}

export async function getJob(slug: string) {
  const data = await runQuery<{ job: JobView | null }>(
    `${JOB} query Job($slug: ID!) { job(slug: $slug) { ...JobFields } }`,
    { slug },
  );
  return data.job;
}

export async function getWork() {
  const data = await runQuery<{ work: WorkEntry[] }>(
    `query Work { work { kind title summary href year client } }`,
  );
  return data.work;
}

export async function getCompany() {
  const data = await runQuery<{ company: Omit<Company, 'phoneHref'> }>(
    `query Company { company { name strapline phone email recruitmentEmail offices { name lines postcode } } }`,
  );
  return data.company;
}
