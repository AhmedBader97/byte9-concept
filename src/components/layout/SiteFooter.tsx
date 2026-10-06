import Link from 'next/link';
import { EmberStop } from '@/components/shared/EmberStop';
import { concept, mainNav } from '@/config/site';
import { company } from '@/content/company';
import { Logo } from './Logo';

export function SiteFooter() {
  return (
    <footer className="site-footer theme-ink">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Logo />
            <p className="site-footer__strapline">
              {company.strapline}
              <EmberStop />
            </p>
          </div>

          <nav className="site-footer__col" aria-label="Footer">
            <h2 className="site-footer__heading">Explore</h2>
            <ul className="site-footer__list">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/search">Search</Link>
              </li>
            </ul>
          </nav>

          <div className="site-footer__col">
            <h2 className="site-footer__heading">Talk to us</h2>
            <ul className="site-footer__list">
              <li>
                <a href={company.phoneHref}>{company.phone}</a>
              </li>
              <li>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>
            </ul>
          </div>

          {company.offices.map((office) => (
            <address className="site-footer__col site-footer__office" key={office.name}>
              <h2 className="site-footer__heading">{office.name}</h2>
              {office.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
              <span>{office.postcode}</span>
            </address>
          ))}
        </div>

        <div className="site-footer__bottom">
          <p>
            Unofficial concept by {concept.author}, built with Next.js, SASS and GraphQL. Content rewritten from{' '}
            <a href={concept.originalSite} rel="noopener">
              thebyte9.com
            </a>
            . <Link href="/concept">About this concept</Link>
          </p>
          <a href="https://www.thebyte9.com/standard-terms-of-business" rel="noopener">
            Terms of business
          </a>
        </div>
      </div>
    </footer>
  );
}
