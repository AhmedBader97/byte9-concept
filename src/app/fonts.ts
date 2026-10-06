import localFont from 'next/font/local';

/**
 * Self-hosted variable fonts through next/font: preloaded, with size-adjusted
 * fallbacks so text doesn't shift when the web font arrives.
 */
export const sans = localFont({
  src: '../../node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2',
  weight: '400 900',
  style: 'normal',
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
});

export const serif = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2',
      weight: '200 800',
      style: 'normal',
    },
    {
      path: '../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2',
      weight: '200 800',
      style: 'italic',
    },
  ],
  variable: '--font-serif',
  display: 'swap',
  // Only used for quotes and long-form copy, so don't compete with the hero.
  preload: false,
  adjustFontFallback: 'Times New Roman',
});
