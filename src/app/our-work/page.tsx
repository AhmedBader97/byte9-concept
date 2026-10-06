import type { Metadata } from 'next';
import { TileField } from '@/components/visuals/TileField';
import { WorkIndex } from '@/components/work/WorkIndex';
import { archive } from '@/content/archive';
import { getArticles, getCaseStudies, getJobs } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'Our work',
  description: 'Case studies, insights and news from Byte9: headless CMS and ecommerce for publishers, retailers and councils.',
};

const ARCHIVE_GROUPS = ['Case study', 'Insight', 'News'] as const;

export default async function OurWorkPage() {
  const [studies, articles, jobs] = await Promise.all([getCaseStudies(), getArticles(), getJobs()]);

  return (
    <>
      <header className="page-intro">
        <TileField avoid=".container > *" />
        <div className="container">
          <p className="page-intro__eyebrow">Our work</p>
          <h1 className="t-h1 page-intro__title">Case studies, insights and news</h1>
          <p className="t-lead page-intro__lead">
            Headless CMS and ecommerce projects for publishers, retailers and the public sector, plus how we build and run
            them.
          </p>
        </div>
      </header>

      <section className="section" aria-label="All work">
        <div className="container">
          <WorkIndex studies={studies} articles={articles} jobs={jobs} />
        </div>
      </section>

      <section className="section theme-white" aria-labelledby="archive-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="archive-title" className="t-h2 section__title">
              From the archive
            </h2>
            <p className="section__intro">
              {archive.length} older posts. These link to the originals on thebyte9.com, so nothing is lost in the
              redesign.
            </p>
          </header>
          <div className="archive">
            {ARCHIVE_GROUPS.map((kind) => {
              const items = archive.filter((item) => item.kind === kind);
              return (
                <section key={kind} className="archive__group" aria-labelledby={`archive-${kind}`}>
                  <h3 id={`archive-${kind}`} className="archive__heading">
                    {kind === 'Case study' ? 'Case studies' : kind === 'Insight' ? 'Insights' : 'News'}
                    <span className="archive__count">{items.length}</span>
                  </h3>
                  <ul className="archive__list">
                    {items.map((item) => (
                      <li key={item.url}>
                        <a href={item.url} rel="noopener" className="archive__link">
                          {item.title}
                          <span className="u-visually-hidden"> (opens thebyte9.com)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
