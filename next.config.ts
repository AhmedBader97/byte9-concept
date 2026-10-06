import type { NextConfig } from 'next';
// JSON so the config can load it without a TypeScript loader.
// A Jest test (src/content/__tests__/redirects.test.ts) keeps it in sync with the content.
import legacyRedirects from './src/content/legacy-redirects.json';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Old thebyte9.com URLs 301 to their new homes.
  async redirects() {
    return legacyRedirects.map((r) => ({ source: r.source, destination: r.destination, permanent: true }));
  },

  // This is an unofficial concept: keep it out of search engines.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
