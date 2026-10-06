import { articles } from './articles';
import { caseStudies } from './case-studies';
import { jobs } from './jobs';

export interface Redirect {
  source: string;
  destination: string;
  permanent: true;
}

/**
 * Maps every legacy thebyte9.com URL we've rebuilt to its new home with a
 * permanent redirect, so search rankings and inbound links survive the
 * migration. next.config.ts reads the JSON copy (legacy-redirects.json);
 * a Jest test fails if the two ever drift apart.
 */
export const legacyRedirects: Redirect[] = [
  ...caseStudies.flatMap((entry) =>
    entry.legacyPaths.map((source) => ({
      source,
      destination: `/our-work/${entry.slug}`,
      permanent: true as const,
    })),
  ),
  ...articles.flatMap((entry) =>
    entry.legacyPaths.map((source) => ({
      source,
      destination: `/our-work/${entry.slug}`,
      permanent: true as const,
    })),
  ),
  ...jobs.flatMap((entry) =>
    entry.legacyPaths.map((source) => ({
      source,
      destination: `/jobs/${entry.slug}`,
      permanent: true as const,
    })),
  ),
  { source: '/standard-terms-of-business', destination: 'https://www.thebyte9.com/standard-terms-of-business', permanent: true },
];
