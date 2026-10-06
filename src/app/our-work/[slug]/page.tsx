import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleList, ContactBand, QuoteBlock } from '@/components/shared/Blocks';
import { CountUp } from '@/components/motion/CountUp';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { CoverArt } from '@/components/visuals/CoverArt';
import { TileField } from '@/components/visuals/TileField';
import { articles } from '@/content/articles';
import { caseStudies } from '@/content/case-studies';
import type { ArticleView, CaseStudyView } from '@/content/types';
import { getArticle, getArticles, getCaseStudies, getCaseStudy } from '@/lib/content-api';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [...caseStudies, ...articles].map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (study) return { title: `${study.client} case study`, description: study.summary };
  const article = await getArticle(slug);
  return article ? { title: article.title, description: article.summary } : {};
}

async function CaseStudyPage({ study }: { study: CaseStudyView }) {
  const all = await getCaseStudies();
  const index = all.findIndex((s) => s.slug === study.slug);
  const previous = index > 0 ? all[index - 1] : undefined;
  const next = index < all.length - 1 ? all[index + 1] : undefined;

  return (
    <>
      <ScrollProgress />
      <header className="case-hero">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li>
                <Link href="/our-work">Our work</Link>
              </li>
              <li aria-current="page">{study.client}</li>
            </ol>
          </nav>
          <p className="case-hero__meta">
            <strong>{study.client}</strong>
            <span>{study.sector}</span>
            {study.year ? <span>{study.year}</span> : null}
          </p>
          <h1 className="t-h1 case-hero__title">{study.title}</h1>
          <p className="t-lead case-hero__lead">{study.summary}</p>
          <div className="case-hero__cover">
            <CoverArt variant={study.cover} seed={study.slug} initial={study.client.charAt(0)} live />
          </div>
        </div>
      </header>

      {study.metrics.length > 0 && (
        <section className="metric-band theme-ink section" aria-label="Results">
          <div className="container">
            <ul className="metric-band__list">
              {study.metrics.map((metric) => (
                <li key={metric.label} className="metric-band__item">
                  <CountUp
                    className="metric-band__value"
                    value={metric.value}
                    prefix={metric.direction === 'down' ? '−' : '+'}
                    suffix="%"
                  />
                  <span className="metric-band__label">{metric.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="section">
        <div className="container split">
          <aside className="split__sticky">
            <div className="fact-list">
              <h2 className="fact-list__title">At a glance</h2>
              <dl className="fact-list__items">
              <div>
                <dt>Client</dt>
                <dd>{study.client}</dd>
              </div>
              <div>
                <dt>Sector</dt>
                <dd>{study.sector}</dd>
              </div>
              {study.year ? (
                <div>
                  <dt>Published</dt>
                  <dd>{study.year}</dd>
                </div>
              ) : null}
              <div>
                <dt>Stack</dt>
                <dd>
                  <ul className="tag-list">
                    {study.stack.map((tech) => (
                      <li key={tech} className="tag">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              </dl>
            </div>
          </aside>

          <div className="prose">
            <h2>The challenge</h2>
            <p>{study.challenge}</p>
            <h2>What we built</h2>
            <ul>
              {study.solution.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h2>The outcome</h2>
            <ul>
              {study.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {study.quote ? (
              <div className="prose__quote">
                <QuoteBlock quote={study.quote} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="container">
        <nav className="pager" aria-label="More case studies">
          {previous && (
            <Link href={`/our-work/${previous.slug}`} className="pager__link">
              <span>Previous case study</span>
              <strong>{previous.client}</strong>
            </Link>
          )}
          {next && (
            <Link href={`/our-work/${next.slug}`} className="pager__link pager__link--next">
              <span>Next case study</span>
              <strong>{next.client}</strong>
            </Link>
          )}
        </nav>
        </div>
      </div>

      <ContactBand />
    </>
  );
}

async function ArticlePage({ article }: { article: ArticleView }) {
  const more = (await getArticles()).filter((a) => a.slug !== article.slug).slice(0, 3);
  return (
    <>
      <ScrollProgress />
      <header className="page-intro">
        <TileField avoid=".container > *" />
        <div className="container container--narrow">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li>
                <Link href="/our-work">Our work</Link>
              </li>
              <li aria-current="page">{article.kind === 'News' ? 'News' : 'Insights'}</li>
            </ol>
          </nav>
          <p className="article-meta">
            <span className="tag">{article.kind}</span>
            {article.year ? <span>{article.year}</span> : null}
          </p>
          <h1 className="t-h1">{article.title}</h1>
          <p className="t-lead page-intro__lead">{article.summary}</p>
        </div>
      </header>

      <article className="section">
        <div className="container container--narrow prose">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </article>

      <section className="section theme-white" aria-labelledby="more-title">
        <div className="container container--narrow">
          <h2 id="more-title" className="t-h3 more-title">
            More insights and news
          </h2>
          <ArticleList articles={more} />
        </div>
      </section>
    </>
  );
}

export default async function WorkEntryPage({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (study) return <CaseStudyPage study={study} />;
  const article = await getArticle(slug);
  if (article) return <ArticlePage article={article} />;
  notFound();
}
