'use client';

import { useEffect, useRef } from 'react';

/**
 * A thin reading-progress bar for long pages. One passive scroll listener,
 * throttled to animation frames, writing a transform only.
 */
export function ScrollProgress({ label = 'Reading progress' }: { label?: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true" title={label}>
      <div ref={bar} className="scroll-progress__bar" />
    </div>
  );
}
