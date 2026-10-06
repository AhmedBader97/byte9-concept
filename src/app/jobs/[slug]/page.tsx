import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { company } from '@/content/company';
import { jobs } from '@/content/jobs';
import { getJob } from '@/lib/content-api';
import { TileField } from '@/components/visuals/TileField';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  return job ? { title: job.title, description: job.summary } : {};
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();

  const subject = encodeURIComponent(`Application: ${job.title}`);

  return (
    <>
      <header className="page-intro">
        <TileField avoid=".container > *" />
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li>
                <Link href="/jobs">Jobs</Link>
              </li>
              <li aria-current="page">{job.title}</li>
            </ol>
          </nav>
          <h1 className="t-h1 page-intro__title">{job.title}</h1>
          <p className="t-lead page-intro__lead">{job.summary}</p>
          <dl className="job-facts">
            <div>
              <dt>Reports to</dt>
              <dd>{job.reportsTo}</dd>
            </div>
            <div>
              <dt>Salary</dt>
              <dd>{job.salary}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{job.location}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="section">
        <div className="container split">
          <aside className="split__sticky">
            <div className="apply-box">
              <h2>How to apply</h2>
              <p>
                Email your CV and a covering letter to{' '}
                <a className="apply-box__email" href={`mailto:${company.recruitmentEmail}?subject=${subject}`}>
                  {company.recruitmentEmail}
                </a>
                . No agencies, please.
              </p>
              <a className="button button--primary" href={`mailto:${company.recruitmentEmail}?subject=${subject}`}>
                Apply by email
              </a>
            </div>
            {job.slug === 'junior-front-end-developer' && (
              <p className="wink">
                This whole site was built as an application for this role.{' '}
                <Link href="/concept" className="text-link">
                  See how
                </Link>
              </p>
            )}
          </aside>

          <div className="prose prose--sans">
            <h2>What you’ll do</h2>
            <ul>
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h2>What you’ll need</h2>
            <ul>
              {job.skills.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {job.niceToHave.length > 0 && (
              <>
                <h2>Good to have</h2>
                <ul>
                  {job.niceToHave.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            <p>
              <Link href="/jobs" className="text-link">
                See all open roles
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
