/**
 * Concept metadata.
 */
export const concept = {
  author: 'Ahmed Bader',
  email: 'bader97@hotmail.co.uk',
  role: 'Junior Front End Developer applicant',
  repoUrl: 'https://github.com/AhmedBader97/byte9-concept',
  originalSite: 'https://www.thebyte9.com',
  links: [
    { label: 'Timelex', href: 'https://timelex.ai' },
    { label: 'YourTradesDigital', href: 'https://www.yourtradesdigital.co.uk' },
  ],
} as const;

export const mainNav = [
  { href: '/about', label: 'About' },
  { href: '/our-work', label: 'Our work' },
  { href: '/blaze', label: 'Blaze' },
  { href: '/sphere', label: 'Sphere' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/contact', label: 'Contact' },
] as const;
