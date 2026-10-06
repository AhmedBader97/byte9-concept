import { type RefObject, useLayoutEffect } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

const SETTLE_MS = 1800; // longest reveal (900ms) plus the last stagger step, with room to spare

/**
 * Scroll reveals for everything marked `data-reveal` inside `ref`:
 * `data-reveal` fades an element up, `data-reveal="group"` staggers its children.
 *
 * Server HTML is fully visible. This runs before the browser paints, marks
 * anything already on screen as revealed (so it is never hidden), and only
 * then hides the rest until it scrolls into view. Once an element has settled
 * it drops the reveal styles, so its own hover transitions work as normal.
 * Without JavaScript, or with reduced motion, nothing is ever hidden.
 */
export function useScrollReveal(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.dataset.revealed = 'true';
          io.unobserve(el);
          timers.push(setTimeout(() => (el.dataset.revealed = 'done'), SETTLE_MS));
        }
      },
      // Any height works: reveal as soon as the top edge is a little way into the viewport
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    );

    const fold = window.innerHeight * 0.9;
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < fold) el.dataset.revealed = 'instant';
      else io.observe(el);
    });
    root.classList.add('js-reveal');

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [ref]);
}
