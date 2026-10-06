'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { easeOutExpo, prefersReducedMotion } from '@/lib/motion';

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

/**
 * Counts from zero to `value` when it scrolls into view. The server renders
 * the final number, so it's correct without JavaScript and for crawlers.
 */
export function CountUp({ value, prefix = '', suffix = '', duration = 1400, delay = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { threshold: 0.4 });
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  // Reset to zero once hydrated (below the fold, so nobody sees the swap).
  useEffect(() => {
    if (!prefersReducedMotion()) setDisplay(0);
  }, []);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now + delay;
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      setDisplay(Math.round(easeOutExpo(t) * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {/* Screen readers always get the final value */}
      <span aria-hidden="true">
        {prefix}
        {display}
        {suffix}
      </span>
      <span className="u-visually-hidden">
        {prefix}
        {value}
        {suffix}
      </span>
    </span>
  );
}
