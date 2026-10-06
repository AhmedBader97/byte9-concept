/**
 * Measured numbers shown on the concept page. Only real measurements go here.
 *
 * Measured on 6 October 2026 against a local production build (`npm run build && npm start`),
 * after the motion and interaction pass (3D Sphere, tile fields, scroll reveals):
 * - Lighthouse 13.5, homepage, desktop preset, median of three runs: 99 / 100 / 100
 *   (performance / accessibility / best practices), CLS 0.
 *   A mobile run in the same sandbox scored 94 / 100 / 100. SEO is lower by design:
 *   the concept is deliberately `noindex`.
 * - Jest: 108 tests passing.
 *
 * After deploying, re-run PageSpeed Insights on the live URL and update these.
 */
export const buildMetrics: {
  lighthouse: { performance: number; accessibility: number; bestPractices: number; device: string } | null;
  tests: number | null;
} = {
  lighthouse: { performance: 99, accessibility: 100, bestPractices: 100, device: 'desktop, median of three runs' },
  tests: 108,
};
