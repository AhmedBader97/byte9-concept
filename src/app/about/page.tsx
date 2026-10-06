import type { Metadata } from 'next';
import Link from 'next/link';
import { PipelineRun } from '@/components/about/PipelineRun';
import { ContactBand, QuoteBlock } from '@/components/shared/Blocks';
import { SphereCanvas } from '@/components/visuals/SphereCanvas';
import { TileField } from '@/components/visuals/TileField';
import { company } from '@/content/company';
import { getCaseStudy } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Byte9 builds open-source digital systems with clients, developers, agencies and government, from London and Reading.',
};

const approach = [
  {
    title: 'Effortless product management',
    body: 'Our no-code platforms let business teams run content and ecommerce with minimal developer time. We specialise in large media sites with ecommerce and complex business logic.',
  },
  {
    title: 'Agile, modern delivery',
    body: 'Agile process, contemporary system design and microservice applications keep delivery efficient, low-risk and cost-effective, with regular updates.',
  },
  {
    title: 'Current technology',
    body: 'JavaScript tooling, NoSQL storage, GraphQL and progressive web apps, tuned for performance, scale and integration, with partners across global SaaS and cloud providers.',
  },
  {
    title: 'Open source, co-sourced',
    body: 'We build in the open with clients and partners, and provide in-house or third-party development teams with project management to match.',
  },
];

export default async function AboutPage() {
  const bear = await getCaseStudy('bear-and-bear');
  return (
    <>
      <header className="page-intro">
        <TileField avoid=".container > *" />
        <div className="container">
          <p className="page-intro__eyebrow">About Byte9</p>
          <h1 className="t-h1 page-intro__title">Open-source software, built with the people who use it</h1>
          <p className="t-lead page-intro__lead">
            We work with clients, developers, agencies and government to build disruptive, open-source digital systems, from
            offices in London and Reading.
          </p>
        </div>
      </header>

      <section className="section" aria-labelledby="approach-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="approach-title" className="t-h2 section__title">
              How we approach a project
            </h2>
          </header>
          <ul className="feature-grid" data-reveal="group">
            {approach.map((item) => (
              <li key={item.title} className="feature-grid__item">
                <h3 className="feature-grid__title">{item.title}</h3>
                <p className="feature-grid__body">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section theme-ink" aria-labelledby="ship-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="ship-title" className="t-h2 section__title">
              How every release ships
            </h2>
            <p className="section__intro">
              Testing isn’t a phase, it’s the default. Each change passes five stages before it reaches a client.{' '}
              <Link href="/our-work/test-driven-development-in-blaze" className="text-link">
                Read about our testing
              </Link>
            </p>
          </header>
          <PipelineRun />
        </div>
      </section>

      <section className="section theme-white" aria-labelledby="products-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="products-title" className="t-h2 section__title">
              Our products
            </h2>
          </header>
          <div className="product-pair" data-reveal="group">
            <article className="product-pair__item">
              <h3 className="product-pair__name">Blaze</h3>
              <p className="product-pair__body">
                Our flagship open-source CMS framework: site building, content management and analytics for non-technical
                teams, on a modern web stack.
              </p>
              <p>
                <Link href="/blaze" className="button button--quiet">
                  Explore Blaze
                </Link>
              </p>
            </article>
            <article className="product-pair__item product-pair__item--sphere">
              <SphereCanvas labels={false} className="sphere--small" label="A rotating sphere of linked points" />
              <h3 className="product-pair__name">Sphere</h3>
              <p className="product-pair__body">
                Natural language processing research that applies machine learning and AI to how content is written and
                shared.
              </p>
              <p>
                <Link href="/sphere" className="button button--quiet">
                  Explore Sphere
                </Link>
              </p>
            </article>
          </div>
        </div>
      </section>

      {bear?.quote && (
        <section className="section section--tight" aria-label="Client testimonial">
          <div className="container container--narrow">
            <QuoteBlock quote={bear.quote} />
          </div>
        </section>
      )}

      <section className="section theme-white" aria-labelledby="offices-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="offices-title" className="t-h2 section__title">
              Where to find us
            </h2>
            <p className="section__intro">
              Call {company.phone} or email{' '}
              <a href={`mailto:${company.email}`} className="text-link">
                {company.email}
              </a>
              .
            </p>
          </header>
          <div className="office-list" data-reveal="group">
            {company.offices.map((office) => (
              <div key={office.name} className="office-list__item">
                <h3>{office.name}</h3>
                <address>
                  {office.lines.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                  {office.postcode}
                </address>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactBand />
    </>
  );
}
