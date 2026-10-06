import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container">
        <div className="not-found__grid" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <h1 className="t-h1">This page isn’t here</h1>
        <p className="t-lead page-intro__lead">
          It may have moved in the redesign. Search the site, or start from one of these.
        </p>
        <div className="button-row not-found__actions">
          <Link href="/search" className="button button--primary">
            Search the site
          </Link>
          <Link href="/our-work" className="button button--secondary">
            Our work
          </Link>
          <Link href="/" className="button button--quiet">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
