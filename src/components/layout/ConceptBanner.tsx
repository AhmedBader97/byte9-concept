import Link from 'next/link';
import { concept } from '@/config/site';

export function ConceptBanner() {
  return (
    <aside className="concept-banner" aria-label="About this website">
      <div className="container concept-banner__inner">
        <p className="concept-banner__text">
          <strong>Unofficial redesign concept</strong> by {concept.author}. Not affiliated with Byte9.
        </p>
        <Link href="/concept" className="concept-banner__link">
          How it was built
        </Link>
      </div>
    </aside>
  );
}
