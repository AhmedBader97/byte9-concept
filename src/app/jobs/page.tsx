import type { Metadata } from 'next';
import { JobList } from '@/components/shared/Blocks';
import { TileField } from '@/components/visuals/TileField';
import { perks, values } from '@/content/company';
import { getJobs } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'Jobs',
  description: 'Join Byte9: full-stack JavaScript, the Blaze headless CMS, flexible working and visa sponsorship.',
};

export default async function JobsPage() {
  const jobs = await getJobs();
  return (
    <>
      <header className="page-intro">
        <TileField avoid=".container > *" />
        <div className="container">
          <p className="page-intro__eyebrow">Jobs at Byte9</p>
          <h1 className="t-h1 page-intro__title">Build beautiful, fast, full-stack JavaScript</h1>
          <p className="t-lead page-intro__lead">
            We’re an experienced team working with agile processes, modern tooling and the cloud. Work from the office, from
            home or fully remote.
          </p>
        </div>
      </header>

      <section className="section" aria-labelledby="roles-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="roles-title" className="t-h2 section__title">
              Open roles
            </h2>
            <p className="section__intro">
              Send your CV and a covering letter for any role. We don’t work with agencies.
            </p>
          </header>
          <JobList jobs={jobs} headingLevel="h3" />
        </div>
      </section>

      <section className="section theme-white" aria-labelledby="perks-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="perks-title" className="t-h2 section__title">
              What you get
            </h2>
          </header>
          <ul className="perks">
            {perks.map((perk) => (
              <li key={perk.title} className="perks__item">
                <h3 className="perks__title">{perk.title}</h3>
                <p className="perks__body">{perk.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="values-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="values-title" className="t-h2 section__title">
              How we work
            </h2>
          </header>
          <ul className="perks perks--three">
            {values.map((value) => (
              <li key={value.title} className="perks__item">
                <h3 className="perks__title">{value.title}</h3>
                <p className="perks__body">{value.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
