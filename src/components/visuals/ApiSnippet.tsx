import { runQuery } from '@/lib/graphql/execute';
import { LiveQuery } from './LiveQuery';

const QUERY = `query {
  caseStudies(
    sector: "Publishing"
  ) {
    client
    metrics {
      label
      value
    }
  }
}`;

/**
 * A real GraphQL request and its response. The response is executed at build
 * time against this site's content API (so it's in the HTML), then the client
 * replays it with motion and can re-run it live.
 */
export async function ApiSnippet() {
  const data = await runQuery<{ caseStudies: { client: string; metrics: { label: string; value: number }[] }[] }>(QUERY);
  // Keep the panel short: clients with numbers first, then one more.
  const trimmed = {
    data: {
      caseStudies: [
        ...data.caseStudies.filter((c) => c.metrics.length > 0),
        ...data.caseStudies.filter((c) => c.metrics.length === 0).slice(0, 1),
      ].map((c) => ({ ...c, metrics: c.metrics.slice(0, 2) })),
    },
  };
  return <LiveQuery query={QUERY} initialLines={JSON.stringify(trimmed, null, 2).split('\n')} trim="publishing" />;
}
