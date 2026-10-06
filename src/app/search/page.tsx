import type { Metadata } from 'next';
import { SearchClient } from '@/components/search/SearchClient';
import { TileField } from '@/components/visuals/TileField';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Byte9 case studies, insights, news and jobs.',
};

export default function SearchPage() {
  return (
    <>
      <header className="page-intro">
        <TileField avoid=".container > *" />
        <div className="container container--narrow">
          <h1 className="t-h1">Search</h1>
          <p className="t-lead page-intro__lead">
            Results come live from the site’s GraphQL API, the same pattern Blaze uses.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container container--narrow">
          <SearchClient />
        </div>
      </section>
    </>
  );
}
