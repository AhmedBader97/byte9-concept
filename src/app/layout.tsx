import type { Metadata, Viewport } from 'next';
import '@/styles/main.scss';
import { ConceptBanner } from '@/components/layout/ConceptBanner';
import { SiteAnalytics } from '@/components/layout/SiteAnalytics';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { sans, serif } from './fonts';

export const metadata: Metadata = {
  title: {
    default: 'Byte9: Digital systems, expertly delivered (redesign concept)',
    template: '%s | Byte9 (redesign concept)',
  },
  description:
    'An unofficial redesign concept of thebyte9.com: headless Blaze CMS, case studies and jobs, rebuilt in Next.js, SASS/BEM and GraphQL by Ahmed Bader.',
  // Unofficial concept: never index it.
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  authors: [{ name: 'Ahmed Bader' }],
};

export const viewport: Viewport = {
  themeColor: '#14214d',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ConceptBanner />
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <SiteAnalytics />
      </body>
    </html>
  );
}
