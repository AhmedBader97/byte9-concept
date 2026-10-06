import type { Metadata } from 'next';
import Link from 'next/link';
import { ApiPlayground } from '@/components/concept/ApiPlayground';
import { TileField } from '@/components/visuals/TileField';
import { archive } from '@/content/archive';
import { articles } from '@/content/articles';
import { caseStudies } from '@/content/case-studies';
import { jobs } from '@/content/jobs';
import redirects from '@/content/legacy-redirects.json';
import { buildMetrics } from '@/config/metrics';
import { concept } from '@/config/site';

export const metadata: Metadata = {
  title: 'About this concept',
  description: 'How and why Ahmed Bader rebuilt thebyte9.com, mapped to the Junior Front End Developer job ad.',
};

const requirements: { requirement: string; evidence: React.ReactNode }[] = [
  {
    requirement: 'Excellent HTML, CSS and JavaScript',
    evidence:
      'Semantic landmarks, real tables for data, hand-written CSS for every component, a 3D canvas Sphere, and drag and drop with FLIP animation.',
  },
  {
    requirement: 'Valid HTML5 and CSS3/4',
    evidence: 'Custom properties, container queries, :focus-visible and text-wrap: balance, with sensible fallbacks.',
  },
  {
    requirement: 'Cross-browser, cross-platform',
    evidence: 'Mobile-first layouts checked at 390, 768 and 1440 px, progressive enhancement and reduced-motion support.',
  },
  {
    requirement: 'SASS and BEM coding standards',
    evidence: (
      <>
        <code>src/styles</code>: a 7-1 style architecture with tokens, functions and mixins, and one BEM block family per
        component partial.
      </>
    ),
  },
  {
    requirement: 'Version control with Git',
    evidence: (
      <>
        The full history is on{' '}
        <a href={concept.repoUrl} className="text-link" rel="noopener">
          GitHub
        </a>
        .
      </>
    ),
  },
  {
    requirement: 'JavaScript frameworks (React)',
    evidence: 'Next.js App Router on React 19, mixing server components with client components where interaction needs them.',
  },
  {
    requirement: 'Testing frameworks (Jest)',
    evidence: 'Jest with React Testing Library and jest-axe: components, reducers, form rules, the GraphQL API and redirects.',
  },
  {
    requirement: 'Isomorphic React',
    evidence: 'Pages render on the server at build time and hydrate in the browser; the same GraphQL schema runs in both.',
  },
  {
    requirement: 'APIs and GraphQL',
    evidence: (
      <>
        A read-only content API at <code>/api/graphql</code>, shaped like Blaze’s. Try it below.
      </>
    ),
  },
  {
    requirement: 'Mobile environments',
    evidence: 'Touch-sized targets, a full-screen mobile menu, and a page builder that previews desktop, tablet and mobile.',
  },
  {
    requirement: 'Node.js',
    evidence: 'The GraphQL resolvers and API route run on Node.js, deployed as serverless functions on Vercel.',
  },
];

export default function ConceptPage() {
  const changes = [
    {
      title: 'Show Blaze, don’t describe it',
      body: 'The homepage opens with a working page builder: add, reorder and publish blocks in seconds.',
    },
    {
      title: 'Results up front',
      body: 'The figures from your case studies, charted on the homepage and on each case study.',
    },
    {
      title: 'Every page carried over',
      body: `${caseStudies.length} case studies, ${articles.length} insights and news posts, ${jobs.length} jobs, and ${archive.length} archive posts linked to the originals.`,
    },
    {
      title: 'No broken links',
      body: `${redirects.length} legacy URLs redirect permanently to their new homes, so rankings and inbound links survive.`,
    },
    {
      title: 'Custom visuals, purposeful motion',
      body: 'Stock photos replaced with art generated in code, plus a 3D Sphere to spin and a builder to drag, all at 60 fps.',
    },
    {
      title: 'Accessible by default',
      body: 'Keyboard support, visible focus, screen-reader labels, reduced motion and AA colour contrast throughout.',
    },
  ];

  return (
    <>
      <header className="page-intro">
        <TileField avoid=".container > *" />
        <div className="container">
          <p className="page-intro__eyebrow">About this concept</p>
          <h1 className="t-h1 page-intro__title">Why I rebuilt thebyte9.com</h1>
          <p className="t-lead page-intro__lead">
            I’m {concept.author}. This unofficial redesign is part of my application for your Junior Front End Developer
            role. It keeps every page and fact from the current site and rebuilds them with the technologies in the job ad.
          </p>
          <div className="page-intro__actions">
            <a href={concept.repoUrl} className="button button--primary" rel="noopener">
              View the code on GitHub
            </a>
            <a href={`mailto:${concept.email}`} className="button button--secondary">
              Email me
            </a>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="changes-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="changes-title" className="t-h2 section__title">
              What’s different
            </h2>
          </header>
          <ul className="feature-grid feature-grid--three" data-reveal="group">
            {changes.map((item) => (
              <li key={item.title} className="feature-grid__item">
                <h3 className="feature-grid__title">{item.title}</h3>
                <p className="feature-grid__body">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section theme-white" aria-labelledby="requirements-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="requirements-title" className="t-h2 section__title">
              Your job ad, mapped to this build
            </h2>
            <p className="section__intro">Every skill in the advert, and where you can see it here.</p>
          </header>
          <table className="req-table">
            <caption className="u-visually-hidden">Junior Front End Developer requirements and where this build shows them</caption>
            <thead>
              <tr>
                <th scope="col">You asked for</th>
                <th scope="col">Where to see it</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((row) => (
                <tr key={row.requirement}>
                  <th scope="row">{row.requirement}</th>
                  <td>{row.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section theme-ink" aria-labelledby="api-title">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="api-title" className="t-h2 section__title">
              Try the content API
            </h2>
            <p className="section__intro">
              These are live requests to <code>/api/graphql</code>. Pick an example or write your own query.
            </p>
          </header>
          <ApiPlayground />
        </div>
      </section>

      {(buildMetrics.lighthouse || buildMetrics.tests) && (
        <section className="section" aria-labelledby="numbers-title">
          <div className="container">
            <header className="section__header" data-reveal>
              <h2 id="numbers-title" className="t-h2 section__title">
                Measured, not claimed
              </h2>
              {buildMetrics.lighthouse && (
                <p className="section__intro">
                  Lighthouse scores for the homepage ({buildMetrics.lighthouse.device}). SEO isn’t scored because the concept
                  deliberately blocks search engines.
                </p>
              )}
            </header>
            <ul className="metric-band__list metric-band__list--light">
              {buildMetrics.lighthouse && (
                <>
                  <li className="metric-band__item">
                    <span className="metric-band__value">{buildMetrics.lighthouse.performance}</span>
                    <span className="metric-band__label">Performance</span>
                  </li>
                  <li className="metric-band__item">
                    <span className="metric-band__value">{buildMetrics.lighthouse.accessibility}</span>
                    <span className="metric-band__label">Accessibility</span>
                  </li>
                  <li className="metric-band__item">
                    <span className="metric-band__value">{buildMetrics.lighthouse.bestPractices}</span>
                    <span className="metric-band__label">Best practices</span>
                  </li>
                </>
              )}
              {buildMetrics.tests && (
                <li className="metric-band__item">
                  <span className="metric-band__value">{buildMetrics.tests}</span>
                  <span className="metric-band__label">Passing Jest tests</span>
                </li>
              )}
            </ul>
          </div>
        </section>
      )}

      <section className="section theme-white" aria-labelledby="note-title">
        <div className="container split split--even">
          <div>
            <h2 id="note-title" className="t-h2">
              A note on content
            </h2>
          </div>
          <div className="prose prose--sans">
            <p>
              The copy is rewritten from the facts on{' '}
              <a href={concept.originalSite} className="text-link" rel="noopener">
                thebyte9.com
              </a>
              : clients, products, figures and contact details are yours; the words are new. Client names are set in type
              rather than reusing anyone’s logo, and every image is generated in code.
            </p>
            <p>
              This site isn’t affiliated with Byte9. It asks search engines not to index it, and the contact form doesn’t send
              anything.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="me-title">
        <div className="container split split--even">
          <h2 id="me-title" className="t-h2">
            About me
          </h2>
          <div className="prose prose--sans">
            <p>
              I’m a full-stack developer with a strong front-end focus and a First-Class BEng in Software Engineering. I’ve
              built front ends at Numatic International, Global Consulting and Tribal Group, and I run my own products,
              Timelex and YourTradesDigital.
            </p>
            <ul>
              {concept.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-link" rel="noopener">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${concept.email}`} className="text-link">
                  {concept.email}
                </a>
              </li>
            </ul>
            <p>
              <Link href="/jobs/junior-front-end-developer" className="text-link">
                The role I’m applying for
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
