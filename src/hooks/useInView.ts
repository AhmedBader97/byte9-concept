'use client';

import { type RefObject, useEffect, useState } from 'react';

interface Options {
  /** Stop observing after the first time the element appears */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/**
 * True while (or once) the element is in the viewport. Used to start
 * animations on arrival and to pause expensive loops when off screen.
 */
export function useInView<T extends Element>(ref: RefObject<T | null>, { once = true, rootMargin = '0px 0px -12% 0px', threshold = 0.15 }: Options = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, rootMargin, threshold]);

  return inView;
}
