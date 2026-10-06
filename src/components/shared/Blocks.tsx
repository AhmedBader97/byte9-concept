import Link from 'next/link';
import type { ArticleView, JobView, Quote } from '@/content/types';
import { clients, company } from '@/content/company';

export function ClientStrip() {
  return (
    <section className="client-strip" aria-labelledby="clients-title">
      <div className="container client-strip__inner">
        <h2 id="clients-title" className="client-strip__title">
          Publishers, retailers and councils that run on Blaze
        </h2>
        {/* Two copies make the loop seamless; the copy is hidden from assistive tech. */}
        <div className="marquee">
          {[false, true].map((copy) => (
            <ul key={String(copy)} className="marquee__track client-strip__list" aria-hidden={copy || undefined}>
              {clients.map((name) => (
                <li key={name} className="client-strip__item">
                  {name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuoteBlock({ quote }: { quote: Quote }) {
  return (
    <figure className="quote" data-reveal>
      <blockquote className="quote__text">
        <p>{quote.text}</p>
      </blockquote>
      <figcaption className="quote__cite">
        <span className="quote__name">{quote.name}</span>
        <span className="quote__role">{quote.role}</span>
      </figcaption>
    </figure>
  );
}

export function ArticleList({ articles, headingLevel = 'h3' }: { articles: ArticleView[]; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <ul className="article-list" data-reveal="group">
      {articles.map((article) => (
        <li key={article.slug} className="article-list__item">
          <p className="article-list__meta">
            <span className="tag">{article.kind}</span>
            {article.year ? <span>{article.year}</span> : null}
          </p>
          <Heading className="article-list__title">
            <Link href={`/our-work/${article.slug}`} className="article-list__link">
              {article.title}
            </Link>
          </Heading>
          <p className="article-list__summary">{article.summary}</p>
        </li>
      ))}
    </ul>
  );
}

export function JobList({ jobs, headingLevel = 'h3' }: { jobs: JobView[]; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <ul className="job-list" data-reveal="group">
      {jobs.map((job) => (
        <li key={job.slug} className="job-list__item">
          <div className="job-list__main">
            <Heading className="job-list__title">
              <Link href={`/jobs/${job.slug}`} className="job-list__link">
                {job.title}
              </Link>
            </Heading>
            <p className="job-list__summary">{job.summary}</p>
          </div>
          <dl className="job-list__facts">
            <div>
              <dt>Location</dt>
              <dd>{job.location}</dd>
            </div>
            <div>
              <dt>Reports to</dt>
              <dd>{job.reportsTo}</dd>
            </div>
          </dl>
          {job.urgent && <span className="job-list__urgent">Hiring urgently</span>}
        </li>
      ))}
    </ul>
  );
}

export function ContactBand({
  title = 'Thinking about moving to Blaze?',
  body = 'Tell us what you run today and where it hurts. We’ll show you what Blaze would change, with numbers from teams like yours.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="contact-band theme-ink" aria-labelledby="contact-band-title">
      {/* The nine-block mark, lighting up one block at a time */}
      <div className="contact-band__grid" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>
      <div className="container contact-band__inner" data-reveal>
        <div>
          <h2 id="contact-band-title" className="t-h2 contact-band__title">
            {title}
          </h2>
          <p className="contact-band__body">{body}</p>
        </div>
        <div className="contact-band__actions">
          <Link href="/contact" className="button button--primary">
            Book a Blaze demo
          </Link>
          <a href={company.phoneHref} className="button button--secondary">
            Call {company.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
