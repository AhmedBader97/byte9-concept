'use client';

import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';

interface InViewProps {
  children: React.ReactNode;
  className?: string;
  /** Keep toggling as the element enters and leaves (to pause loops off screen) */
  repeat?: boolean;
  as?: 'div' | 'section';
}

/**
 * Wraps server-rendered content and sets `data-inview` when it's on screen,
 * so CSS can start (or pause) animations without shipping logic per component.
 */
export function InView({ children, className, repeat = false, as: Tag = 'div' }: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: !repeat, threshold: 0.2 });
  return (
    <Tag ref={ref} className={className} data-inview={inView ? 'true' : 'false'}>
      {children}
    </Tag>
  );
}
