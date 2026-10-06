# Byte9 redesign concept

An **unofficial** redesign of [thebyte9.com](https://www.thebyte9.com), built by Ahmed Bader as part of an application for Byte9’s Junior Front End Developer role. It is not affiliated with Byte9, asks search engines not to index it, and its contact form sends nothing.

Every page and fact from the current site is carried over: 11 case studies, 9 insights and news posts, 5 jobs, the About, Blaze, Sphere and Contact pages, and 46 older posts linked to the originals. The copy is rewritten, client names are set in type rather than reusing logos, and the stock photography is replaced with artwork generated in code.

**Live:** [byte9-concept-by-ahmed.vercel.app](https://byte9-concept-by-ahmed.vercel.app)

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · SASS with BEM · GraphQL · Jest + React Testing Library + jest-axe

---

## Run it locally

Requires Node.js 20.9 or newer.

```bash
git clone https://github.com/AhmedBader97/byte9-concept.git
cd byte9-concept
npm install
npm run dev        # http://localhost:3000
npm test           # 108 tests
npm run typecheck  # TypeScript, strict mode
npm run build      # production build (39 pages, all prerendered except the API)
npm start          # serve the production build
```

## Deploy to Vercel

The code is on GitHub at [AhmedBader97/byte9-concept](https://github.com/AhmedBader97/byte9-concept).

### 1. Import the repository into Vercel

On vercel.com, choose **Add New → Project**, then fill in the import screen like this:

| Field | Value |
| --- | --- |
| Import Git Repository | `byte9-concept` |
| Project Name | `byte9-concept-by-ahmed` (your name in it, so it can’t be mistaken for Byte9’s own site) |
| Framework Preset | Next.js (detected automatically) |
| Root Directory | `./` |
| Build Command | leave the default (`next build`) |
| Output Directory | leave the default |
| Install Command | leave the default (`npm install`) |
| Environment Variables | none needed |

Press **Deploy**. The site goes live at `https://byte9-concept-by-ahmed.vercel.app`, and every push to `main` redeploys it.

### 2. After the first deploy

- Run [PageSpeed Insights](https://pagespeed.web.dev) on the live URL and, if the numbers differ, update `src/config/metrics.ts`.
- Check `https://<your-url>/kogan-page-case-study` redirects to `/our-work/kogan-page`: that proves the legacy redirects work on Vercel.

---

## What to look at (interview notes)

### The homepage page builder
`src/components/home/PageBuilderDemo.tsx`: a working miniature of the Blaze Page Builder. State lives in a pure reducer (`builderReducer`), so it is unit-tested without the DOM. The preview uses **CSS container queries**, so the article grid reflows from three columns to one as the device frame narrows, independent of the browser width. Publishing runs a simulated version of Byte9’s real pipeline (lint, unit, visual, deploy). Every change is announced to screen readers through a live region, and reduced-motion users skip the animation.

### Motion and interaction
Every animation has a job, runs at 60 fps, pauses when it is off screen or the tab is hidden, and has a reduced-motion version.

- **The Sphere** (`src/components/visuals/SphereCanvas.tsx`, maths in `src/lib/sphere-math.ts`): 560 points on a Fibonacci lattice, projected in 3D on a 2D canvas. Key topics are joined by lifted great-circle arcs with signals running along them. On first view the points swirl in and gather into the sphere. You can fling it with inertia, hover a topic to light up its links, or press a topic button to rotate it to the front by the shortest route (`rotationToFront`, unit-tested). Points are drawn in 12 depth bands, one path each, with no allocations per frame.
- **Tile field** (`src/components/visuals/TileField.tsx`): small tiles from the Byte9 mark, gathered around the page builder on the homepage and beside the intro on inner pages. A slow wave moves through it, the odd tile lights up ember, and tiles near the pointer warm up. It measures the text and keeps clear of it.
- **Page builder**: drag layers by their grip (Pointer Events with pointer capture). Layers and preview blocks glide into place with FLIP, using the Web Animations API (`src/hooks/useFlip.ts`). Publishing sends a ripple through the preview.
- **Live GraphQL panel** on `/blaze`: the query types itself, then the response streams in. “Run it again” sends a real request and shows the round-trip time. The panel's final size is reserved up front, so it causes no layout shift.
- **Scroll reveals** (`src/hooks/useScrollReveal.ts`): one IntersectionObserver per page, with staggered groups. It runs before paint and never hides content that is already on screen. Elements drop their reveal styles once settled, so their own hover transitions still work.
- **Smaller details**:
  - the release pipeline on `/about` runs stage by stage;
  - results bars grow and their numbers count up;
  - client names scroll in a marquee that pauses on hover;
  - case study covers animate on hover and drift in a scroll-driven parallax (`animation-timeline: view()`);
  - pages fade in between routes, but not on first load, to protect LCP;
  - the header hides on scroll down and returns on scroll up;
  - articles show reading progress;
  - the logo mark ripples on hover;
  - the full stop in “expertly delivered.” is the ember square from the mark.

### Isomorphic React with a GraphQL content layer
- `src/content/`: typed content collections (the “CMS”).
- `src/lib/graphql/schema.ts`: a GraphQL schema and resolvers over that content, shaped like Blaze’s headless API.
- `src/lib/content-api.ts`: pages query the schema **in-process at build time**, so every page is static HTML.
- `src/app/api/graphql/route.ts`: the same schema served over HTTP for the browser. The live search (`/search`) and the API playground on `/concept` use it.
- Swapping the content source for a real CMS would only touch the resolvers.

### SASS architecture and BEM
`src/styles/` follows a trimmed 7-1 pattern:

```
abstracts/   tokens, rem() and fluid() functions, mixins (mq, focus-ring, motion-ok)
base/        custom properties, reset, typography, globals
layout/      container, section, page intro, splits
components/  one partial per BEM block family (button, builder, results, case-card...)
```

Colours are defined once as tokens and emitted as CSS custom properties, so a section can flip its whole theme with one class (`.theme-ink`). Radii follow hierarchy (controls, panels, device frames, tags) rather than one value everywhere.

### Accessibility
Semantic landmarks, a skip link, visible focus, keyboard-operable everything, `aria-pressed` and `aria-expanded` on toggles, live regions for dynamic updates, a GOV.UK-style error summary on the contact form, and AA colour contrast. The results chart is a real `<table>` styled as bars, so screen readers read the numbers. Components are checked with jest-axe; Lighthouse accessibility is 100 on every page audited.

### Legacy URLs
`src/content/legacy-redirects.json` permanently redirects 32 old thebyte9.com URLs to their new homes (`next.config.ts`). A Jest test fails if the JSON drifts from the content or points at a page that doesn’t exist.

### Performance
Static generation, self-hosted variable fonts through `next/font` (preloaded, size-adjusted fallbacks, zero layout shift), no images to download (all artwork is inline SVG), and client JavaScript only where interaction needs it.

Measured on a local production build with Lighthouse 13.5, after the motion pass (homepage, desktop preset, median of three runs): **performance 99, accessibility 100, best practices 100, CLS 0**. A mobile run in the build sandbox scored 94. Sandbox CPU is noisy, so check the deployed site with PageSpeed Insights. SEO is intentionally low: the concept blocks indexing.

### Tests (108)
| Area | File |
| --- | --- |
| Content integrity (unique slugs, required copy, quote length) | `src/content/__tests__/content.test.ts` |
| Redirects stay in sync and resolve | `src/content/__tests__/redirects.test.ts` |
| GraphQL schema, filters, search ranking | `src/lib/graphql/__tests__/schema.test.ts` |
| API route: validation, limits, errors, caching | `src/app/api/graphql/__tests__/route.test.ts` |
| Page builder reducer and UI, plus axe | `src/components/home/__tests__/PageBuilderDemo.test.tsx` |
| Contact form rules, error summary, success, plus axe | `src/components/forms/__tests__/ContactForm.test.tsx` |
| Header navigation and mobile menu, plus axe | `src/components/layout/__tests__/SiteHeader.test.tsx` |
| Our work filters and empty state | `src/components/work/__tests__/WorkIndex.test.tsx` |
| Results chart scaling and table semantics, plus axe | `src/components/home/__tests__/ResultsChart.test.tsx` |
| Generated artwork is deterministic | `src/components/visuals/__tests__/CoverArt.test.tsx` |
| Sphere, live GraphQL panel and release pipeline: fallbacks, topic buttons, typing, real re-runs | `src/components/visuals/__tests__/interactive.test.tsx` |
| 3D maths: lattice, rotate-to-front, great-circle arcs | `src/lib/__tests__/sphere-math.test.ts` |
| Count-ups, page transitions, scroll reveals, marquee, brand details (reduced motion included) | `src/components/motion/__tests__/motion.test.tsx` |

## The job ad, mapped to this build

| Requirement | Where it shows |
| --- | --- |
| Excellent HTML, CSS, JavaScript | Semantic markup, hand-written CSS for every component, a 3D canvas sphere, FLIP animation with the Web Animations API, drag and drop with Pointer Events |
| Valid HTML5 and CSS3/4 | Custom properties, container queries, `:focus-visible`, `text-wrap: balance` |
| Cross-browser, cross-platform | Mobile-first, checked at 390, 768 and 1440 px, progressive enhancement |
| SASS / BEM | `src/styles` |
| Git | This repository |
| AngularJS / React | Next.js App Router, React 19 server and client components |
| Jest / Mocha / Chai | 108 Jest tests with React Testing Library and jest-axe |
| Isomorphic React | Build-time server rendering plus hydration; one GraphQL schema on both sides |
| APIs / GraphQL | `/api/graphql` |
| Mobile environments | Touch-sized targets, full-screen mobile menu, device previews in the builder |
| Node.js | GraphQL resolvers and the API route run on Node.js (serverless on Vercel) |

## Project structure

```
src/
  app/                 routes (App Router), fonts, robots, icon
    api/graphql/       GraphQL endpoint
    our-work/[slug]/   case studies, insights and news
    jobs/[slug]/       job listings
  components/          React components, grouped by area
  config/              site and measurement config
  content/             typed content + legacy redirects
  hooks/               useInView, useFlip, useScrollReveal, useReducedMotion
  lib/                 GraphQL schema, data access, motion and 3D maths, text utilities
  styles/              SASS architecture (BEM)
```

## Content note

Facts (clients, products, figures, contact details) come from thebyte9.com; the words are new. Short client quotes are kept under 15 words. Older posts that aren’t rebuilt link to the originals.
