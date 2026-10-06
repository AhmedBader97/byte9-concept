'use client';

import { type RefObject, useCallback, useLayoutEffect, useRef } from 'react';
import { EASE_OUT, prefersReducedMotion } from '@/lib/motion';

function items(root: HTMLElement | null) {
  return root ? Array.from(root.querySelectorAll<HTMLElement>('[data-flip]')) : [];
}

function measure(elements: HTMLElement[]) {
  const rects = new Map<string, DOMRect>();
  for (const element of elements) {
    if (element.dataset.flip) rects.set(element.dataset.flip, element.getBoundingClientRect());
  }
  return rects;
}

/**
 * FLIP (First, Last, Invert, Play) list animation.
 *
 * Children marked with `data-flip="<stable key>"` glide from their previous
 * position to their new one whenever `deps` change; new children fade in.
 * Runs on the Web Animations API and does nothing for reduced-motion visitors.
 *
 * Returns `snapshot()`: call it right before a change to record positions as
 * they look at that moment (for example mid-drag), instead of the last render.
 */
export function useFlip<T extends HTMLElement>(
  container: RefObject<T | null>,
  deps: unknown[],
  { duration = 380, enter = true }: { duration?: number; enter?: boolean } = {},
) {
  const previous = useRef<Map<string, DOMRect> | null>(null);
  // Only our own animations are cancelled; CSS animations on the same elements are left alone.
  const running = useRef(new Set<Animation>());

  const snapshot = useCallback(() => {
    previous.current = measure(items(container.current));
  }, [container]);

  useLayoutEffect(() => {
    const elements = items(container.current);
    if (elements.length === 0) return;

    // Stop anything still in flight so we measure true layout positions.
    running.current.forEach((animation) => animation.cancel());
    running.current.clear();

    const before = previous.current;
    const after = measure(elements);
    previous.current = after;
    if (before === null || prefersReducedMotion()) return;

    const track = (animation: Animation) => {
      running.current.add(animation);
      animation.onfinish = () => running.current.delete(animation);
    };

    for (const element of elements) {
      const key = element.dataset.flip;
      if (!key || typeof element.animate !== 'function') continue;
      const rect = after.get(key);
      const old = before.get(key);
      if (!rect) continue;
      if (old) {
        const dx = old.left - rect.left;
        const dy = old.top - rect.top;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          track(
            element.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
              duration,
              easing: EASE_OUT,
            }),
          );
        }
      } else if (enter) {
        track(
          element.animate(
            [
              { opacity: 0, transform: 'translateY(8px) scale(0.97)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: duration * 0.85, easing: EASE_OUT },
          ),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return snapshot;
}
