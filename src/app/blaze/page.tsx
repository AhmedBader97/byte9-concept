import type { Metadata } from 'next';
import Link from 'next/link';
import { PlatformDiagram } from '@/components/home/PlatformDiagram';
import { ContactBand } from '@/components/shared/Blocks';
import { ApiSnippet } from '@/components/visuals/ApiSnippet';
import { CaseCard } from '@/components/work/CaseCard';
import { getCaseStudies } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'Blaze headless CMS',
  description:
    'Blaze is an open-source, no-code headless CMS for content, ecommerce and data, built on React, Next.js, Node.js and GraphQL.',
};

const capabilities = [
  { title: 'Personalise every component', body: 'Tailor page components by audience and by device.' },
  { title: 'Own your audience data', body: 'Capture first-party engagement data as people use your site.' },
  { title: 'Sell smarter advertising', body: 'Offer micro-targeted ad placements based on content and context.' },
  { title: 'Blend products with stories', body: 'Mix live product data with editorial content on any page.' },
  { title: 'Bring your archive back to life', body: 'Optimise years of archive content for search and discovery.' },
  { title: 'Connect your SaaS tools', body: 'Plug in commerce, analytics, CRM and marketing platforms.' },
];

const stack = [
  { term: 'Front end', detail: 'React and Next.js, served as a fast single-page application with server-side rendering.' },
  { term: 'API', detail: 'A GraphQL API framework on Node.js, decoupled and plugin-based.' },
  { term: 'Data', detail: 'NoSQL data stores and Elasticsearch for search.' },
  { term: 'Cloud', detail: 'Serverless and microservice computing, provisioned with Terraform.' },
  { term: 'Delivery', detail: 'Continuous delivery with immutable deployments.' },
  { term: 'Quality', detail: 'Automated code quality checks, vulnerability scanning and package management.' },
];

export default async function BlazePage() {
  const studies = await getCaseStudies();
  const blazeStudies = studies.filter((s) => s.stack.includes('Blaze')).slice(0, 6);

  return (
    <>
      <section className="page-hero" aria-labelledby="blaze-title">
        <div className="container page-hero__inner">
          <div>
            <p className="page-hero__eyebrow">Blaze by Byte9</p>
            <h1 id="blaze-title" className="t-h1 page-hero__title">
              Build and run websites without waiting on developers
            </h1>
            <p className="t-lead page-hero__lead">
              Blaze is an open-source, no-code CMS for content, ecommerce and data. A headless back end and a fast React
              front end, in one hybrid platform.
            </p>
            <div className="button-row page-hero__actions">
              <Link href="/contact" className="button button--primary">
                Book a Blaze demo
              </Link>
              <Link href="#blaze-work" className="button button--secondary">
                See it in use
              </Link>
            </div>
          </div>
          <ApiSnippet />
        </div>
      </section>

      <section className="section theme-white" aria-labelledby="hybrid-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="hybrid-title" className="t-h2 section__title">
              Headless where it counts, no-code where it matters
            </h2>
            <p className="section__intro">
              Your teams build transactional sites in the page builder, while developers get a decoupled GraphQL platform
              to extend.
            </p>
          </header>
          <PlatformDiagram />
        </div>
      </section>

      <section className="section" aria-labelledby="capabilities-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="capabilities-title" className="t-h2 section__title">
              New, high-value functionality for the web
            </h2>
          </header>
          <ul className="feature-grid feature-grid--three" data-reveal="group">
            {capabilities.map((item) => (
              <li key={item.title} className="feature-grid__item">
                <h3 className="feature-grid__title">{item.title}</h3>
                <p className="feature-grid__body">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section theme-ink" aria-labelledby="stack-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="stack-title" className="t-h2 section__title">
              Progressive technology, lower running costs
            </h2>
            <p className="section__intro">
              A modern JavaScript stack, deployed to the cloud as code.{' '}
              <Link href="/our-work/continuous-integration-and-deployment" className="text-link">
                How we ship
              </Link>
            </p>
          </header>
          <dl className="tech-list" data-reveal="group">
            {stack.map((item) => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section theme-white" aria-labelledby="cosource-title">
        <div className="container split split--even">
          <div>
            <h2 id="cosource-title" className="t-h2">
              Co-source it with the people who build it
            </h2>
            <p className="t-lead page-hero__lead">
              Blaze is a leading open-source project. Work with us directly, or bring your own team and we’ll support them.
            </p>
          </div>
          <ul className="check-list" data-reveal="group">
            <li>Open-source licence, so you’re never locked in.</li>
            <li>Co-sourced development with Byte9’s engineers.</li>
            <li>Technical project management when you need it.</li>
            <li>Operational support for internal and third-party teams.</li>
            <li>Less operational risk and supplier dependency.</li>
          </ul>
        </div>
      </section>

      <section id="blaze-work" className="section" aria-labelledby="blaze-work-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="blaze-work-title" className="t-h2 section__title">
              Blaze in production
            </h2>
            <p className="section__intro">Publishers, retailers and councils running on Blaze today.</p>
          </header>
          <div className="case-grid case-grid--three" data-reveal="group">
            {blazeStudies.map((study) => (
              <CaseCard key={study.slug} study={study} />
            ))}
          </div>
        </div>
      </section>

      <ContactBand title="See Blaze in action" body="We’ll walk you through the page builder, the API and a live client site." />
    </>
  );
}
