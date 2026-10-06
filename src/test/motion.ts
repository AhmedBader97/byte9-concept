/** Test helper: switch prefers-reduced-motion on or off for the current test. */
export function mockReducedMotion(reduce: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion: reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}
