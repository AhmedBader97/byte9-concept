import Link from 'next/link';
import type { CaseStudyView } from '@/content/types';
import { CoverArt } from '@/components/visuals/CoverArt';

interface CaseCardProps {
  study: CaseStudyView;
  size?: 'large' | 'standard';
  headingLevel?: 'h2' | 'h3';
}

export function formatMetric(value: number, direction: 'up' | 'down') {
  return `${direction === 'down' ? '−' : '+'}${value}%`;
}

export function CaseCard({ study, size = 'standard', headingLevel = 'h3' }: CaseCardProps) {
  const Heading = headingLevel;
  const lead = study.metrics[0];
  return (
    <article className={`case-card case-card--${size}`}>
      <div className="case-card__media">
        <CoverArt variant={study.cover} seed={study.slug} initial={study.client.charAt(0)} />
      </div>
      <div className="case-card__body">
        <p className="case-card__client">
          {study.client}
          <span className="case-card__sector">{study.sector}</span>
        </p>
        <Heading className="case-card__title">
          <Link href={`/our-work/${study.slug}`} className="case-card__link">
            {study.title}
          </Link>
        </Heading>
        {size === 'large' && <p className="case-card__summary">{study.summary}</p>}
        {lead && (
          <p className="case-card__metric">
            <strong>{formatMetric(lead.value, lead.direction)}</strong> {lead.label.toLowerCase()}
          </p>
        )}
      </div>
    </article>
  );
}
