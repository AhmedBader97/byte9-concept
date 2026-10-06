import Link from 'next/link';
import { Fragment } from 'react';
import { PageBuilderDemo } from '@/components/home/PageBuilderDemo';
import { PlatformDiagram } from '@/components/home/PlatformDiagram';
import { ResultsChart, type ResultPanel, type ResultRow } from '@/components/home/ResultsChart';
import { ArticleList, ClientStrip, ContactBand, JobList, QuoteBlock } from '@/components/shared/Blocks';
import { EmberStop } from '@/components/shared/EmberStop';
import { TileField } from '@/components/visuals/TileField';
import { CaseCard } from '@/components/work/CaseCard';
import { getArticles, getCaseStudies, getJobs } from '@/lib/content-api';

// Each word rises out of its own mask on load: the page's one orchestrated entrance.
// The full stop is the ember square from the Byte9 mark, and lands last.
const HEADLINE = ['Digital', 'systems,', 'expertly', 'delivered'];

const AUDIENCE = new Set(['Users', 'Page views', 'New users', 'Active users', 'Average time on page']);

export default async function HomePage() {
  const [studies, articles, jobs] = await Promise.all([getCaseStudies(), getArticles(), getJobs()]);

  const rows: ResultRow[] = studies.flatMap((s) =>
    s.metrics.map((m) => ({ client: s.client, label: m.label, value: m.value, direction: m.direction, href: `/our-work/${s.slug}` })),
  );
  const byValue = (a: ResultRow, b: ResultRow) => b.value - a.value;
  const panels: ResultPanel[] = [
    { title: 'Audience growth', rows: rows.filter((r) => AUDIENCE.has(r.label)).sort(byValue) },
    { title: 'Speed and sales', rows: rows.filter((r) => !AUDIENCE.has(r.label)).sort(byValue) },
  ];

  const featured = studies.filter((s) => s.featured);
  const [lead, ...rest] = featured;
  const quote = studies.find((s) => s.slug === 'kogan-page')?.quote;

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <TileField anchor=".hero__demo" avoid=".hero__copy" />
        <div className="container hero__inner">
          <div className="hero__copy">
            <h1 id="hero-title" className="t-display hero__title">
              {HEADLINE.map((word, i) => (
                <Fragment key={word}>
                  <span className="hero__word">
                    <span style={{ '--i': i } as React.CSSProperties}>{word}</span>
                  </span>
                  {i < HEADLINE.length - 1 ? ' ' : <EmberStop className="hero__stop" />}
                </Fragment>
              ))}
            </h1>
            <p className="t-lead hero__lead">
              We build fast, data-rich websites and web apps on Blaze, our open-source headless CMS. Publishers, retailers
              and councils use it to run their sites without writing code.
            </p>
            <div className="button-row hero__actions">
              <Link href="/contact" className="button button--primary">
                Book a Blaze demo
              </Link>
              <Link href="/our-work" className="button button--secondary">
                See our work
              </Link>
            </div>
            <p className="hero__aside">
              <strong>Now on G-Cloud 14.</strong> Public sector teams can buy Blaze through the Digital Marketplace.{' '}
              <Link href="/our-work/g-cloud-14-supplier-status" className="text-link">
                Read the news
              </Link>
            </p>
          </div>

          <div className="hero__demo">
            <PageBuilderDemo />
            <p className="hero__demo-caption">A working demo: add, reorder and publish blocks, the way Blaze editors do.</p>
          </div>
        </div>
      </section>

      <ClientStrip />

      <section className="section theme-ink" aria-labelledby="results-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="results-title" className="t-h2 section__title">
              Results our clients can measure
            </h2>
            <p className="section__intro">
              Change after moving to Blaze, as reported in each client’s case study. Select a client to read how we got
              there.
            </p>
          </header>
          <ResultsChart panels={panels} />
        </div>
      </section>

      <section className="section theme-white" aria-labelledby="platform-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="platform-title" className="t-h2 section__title">
              One platform for content, commerce and data
            </h2>
            <p className="section__intro">
              Your teams build pages in a no-code editor. Your audience gets a fast React site. Your commerce and data tools
              plug straight in.
            </p>
          </header>
          <PlatformDiagram />
          <p className="section__more">
            <Link href="/blaze" className="button button--quiet">
              Explore Blaze
            </Link>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="work-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="work-title" className="t-h2 section__title">
              Recent work
            </h2>
            <p className="section__intro">From superyacht publishing to district council services.</p>
          </header>
          <div className="case-grid" data-reveal="group">
            {lead && <CaseCard study={lead} size="large" />}
            {rest.map((study) => (
              <CaseCard key={study.slug} study={study} />
            ))}
          </div>
          <p className="section__more">
            <Link href="/our-work" className="button button--quiet">
              All case studies and insights
            </Link>
          </p>
        </div>
      </section>

      {quote && (
        <section className="section section--tight theme-white" aria-label="Client testimonial">
          <div className="container container--narrow">
            <QuoteBlock quote={quote} />
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="insights-title">
        <div className="container">
          <div className="split">
            <header className="split__sticky" data-reveal>
              <h2 id="insights-title" className="t-h2">
                Insights and news
              </h2>
              <p className="section__intro home-split__intro">How we build, test and run Blaze, and what’s new.</p>
              <p className="section__more">
                <Link href="/our-work" className="button button--quiet">
                  More insights and news
                </Link>
              </p>
            </header>
            <ArticleList articles={articles.slice(0, 4)} />
          </div>
        </div>
      </section>

      <section className="section theme-white" aria-labelledby="jobs-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="jobs-title" className="t-h2 section__title">
              We’re hiring
            </h2>
            <p className="section__intro">
              Flexible working, visa sponsorship and a modern JavaScript stack. {jobs.length} roles are open.
            </p>
          </header>
          <JobList jobs={jobs.slice(0, 3)} />
          <p className="section__more">
            <Link href="/jobs" className="button button--quiet">
              See all {jobs.length} roles
            </Link>
          </p>
        </div>
      </section>

      <ContactBand />
    </>
  );
}
