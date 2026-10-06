/**
 * Content model for the Byte9 concept site.
 *
 * Every page reads its data through the GraphQL layer in `src/lib/graphql`,
 * which resolves against these typed collections — the same "headless" shape
 * Blaze uses, so swapping the source for a real CMS later only touches the
 * resolvers.
 */

export type Sector = 'Publishing' | 'Ecommerce' | 'Public sector' | 'Voice';

export type CoverStyle = 'masthead' | 'waves' | 'catalogue' | 'civic' | 'waveform' | 'shelf' | 'parts';

export interface Metric {
  /** What changed, e.g. "Users" */
  label: string;
  /** Size of the change in percent, always positive */
  value: number;
  /** Whether the number went up or down (down is good for load time) */
  direction: 'up' | 'down';
}

export interface Quote {
  text: string;
  name: string;
  role: string;
}

export interface CaseStudy {
  slug: string;
  client: string;
  title: string;
  sector: Sector;
  summary: string;
  challenge: string;
  solution: string[];
  stack: string[];
  outcomes: string[];
  metrics: Metric[];
  year?: number | null;
  quote?: Quote | null;
  featured: boolean;
  cover: CoverStyle;
  /** Old URLs on thebyte9.com that should 301 to this page */
  legacyPaths: string[];
}

export type ArticleKind = 'Insight' | 'News';

export interface ArticleSection {
  heading: string;
  body: string[];
}

export interface Article {
  slug: string;
  kind: ArticleKind;
  title: string;
  summary: string;
  year?: number | null;
  tags: string[];
  sections: ArticleSection[];
  legacyPaths: string[];
}

export interface Job {
  slug: string;
  title: string;
  reportsTo: string;
  salary: string;
  location: string;
  summary: string;
  responsibilities: string[];
  skills: string[];
  niceToHave: string[];
  urgent: boolean;
  legacyPaths: string[];
}

export interface ArchiveItem {
  title: string;
  kind: 'Case study' | 'Insight' | 'News';
  /** Original URL on thebyte9.com */
  url: string;
}

export interface Office {
  name: string;
  lines: string[];
  postcode: string;
}

export interface Company {
  name: string;
  strapline: string;
  phone: string;
  phoneHref: string;
  email: string;
  recruitmentEmail: string;
  offices: Office[];
}

/** One searchable/listable entry on the Our work page */
export interface WorkEntry {
  kind: 'Case study' | 'Insight' | 'News' | 'Job';
  title: string;
  summary: string;
  href: string;
  year?: number | null;
  client?: string | null;
}

/** Shapes returned by the GraphQL API (internal fields like legacyPaths are not exposed). */
export type CaseStudyView = Omit<CaseStudy, 'legacyPaths'>;
export type ArticleView = Omit<Article, 'legacyPaths'>;
export type JobView = Omit<Job, 'legacyPaths'>;

export interface SearchHit {
  kind: WorkEntry['kind'];
  title: string;
  summary: string;
  href: string;
}
