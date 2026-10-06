import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactBand, QuoteBlock } from '@/components/shared/Blocks';
import { SphereCanvas } from '@/components/visuals/SphereCanvas';
import { SphereVisual } from '@/components/visuals/SphereVisual';
import { getCaseStudy } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'Sphere',
  description: 'Sphere by Byte9: AI-powered content analysis for Blaze CMS, from natural language processing research.',
};

const features = [
  { title: 'Optimise content and mark-up', body: 'Find what to improve in each piece, from structure to metadata.' },
  { title: 'Isolate key language', body: 'Surface the words and phrases that carry each article.' },
  { title: 'Write with more resonance', body: 'Give editors guidance that helps content connect with readers.' },
  { title: 'Connect content to engagement', body: 'Share content mark-up alongside engagement data and analytics.' },
  { title: 'Market across platforms', body: 'Use the same understanding of your content on every channel.' },
  { title: 'Analyse at scale', body: 'Combined with Blaze, analyse whole archives, not just new stories.' },
];

export default async function SpherePage() {
  const gloss = await getCaseStudy('get-the-gloss');
  return (
    <>
      <section className="page-hero" aria-labelledby="sphere-title">
        <div className="container page-hero__inner">
          <div>
            <p className="page-hero__eyebrow">Sphere by Byte9</p>
            <h1 id="sphere-title" className="t-h1 page-hero__title">
              Language intelligence for everything you publish
            </h1>
            <p className="t-lead page-hero__lead">
              Sphere grew out of natural language processing research that Byte9 sponsors. It uses AI and machine learning
              to understand content, so teams can write, manage and market it better.
            </p>
            <div className="button-row page-hero__actions">
              <Link href="/contact" className="button button--primary">
                Ask about Sphere
              </Link>
              <a href="https://thisissphere.com" className="button button--secondary" rel="noopener">
                Visit thisissphere.com
              </a>
            </div>
          </div>
          <SphereCanvas
            controls
            fallback={<SphereVisual />}
            label="A sphere of points representing content, with key topics linked into a network. Drag to turn it, or bring a topic to the front with the buttons below."
          />
        </div>
      </section>

      <section className="section theme-white" aria-labelledby="sphere-features">
        <div className="container">
          <header className="section__header" data-reveal>
            <h2 id="sphere-features" className="t-h2 section__title">
              What Sphere does
            </h2>
            <p className="section__intro">
              Topological content analysis: mapping how ideas in your content relate, then putting that to work for
              editors and marketers.
            </p>
          </header>
          <ul className="feature-grid feature-grid--three" data-reveal="group">
            {features.map((feature) => (
              <li key={feature.title} className="feature-grid__item">
                <h3 className="feature-grid__title">{feature.title}</h3>
                <p className="feature-grid__body">{feature.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="sphere-availability">
        <div className="container split split--even">
          <h2 id="sphere-availability" className="t-h2">
            Built into Blaze, open to your archive
          </h2>
          <ul className="check-list" data-reveal="group">
            <li>Available as a plugin for Blaze.</li>
            <li>Works with content imported from other CMSs.</li>
            <li>Scales to large archives when combined with Blaze.</li>
          </ul>
        </div>
      </section>

      {gloss?.quote && (
        <section className="section section--tight theme-white" aria-label="Client testimonial">
          <div className="container container--narrow">
            <QuoteBlock quote={gloss.quote} />
          </div>
        </section>
      )}

      <ContactBand
        title="See what Sphere finds in your content"
        body="Share a sample of your articles and we’ll show you the language and connections Sphere surfaces."
      />
    </>
  );
}
