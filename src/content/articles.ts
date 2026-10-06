import type { Article } from './types';

/**
 * Insights and news. Rewritten summaries of articles published on thebyte9.com.
 */
export const articles: Article[] = [
  {
    slug: 'g-cloud-14-supplier-status',
    kind: 'News',
    title: 'Blaze is now on G-Cloud 14',
    summary:
      'Crown Commercial Service has awarded Byte9 G-Cloud 14 supplier status, so councils and public bodies can buy Blaze through the Digital Marketplace.',
    year: 2024,
    tags: ['Public sector', 'Blaze'],
    sections: [
      {
        heading: 'What changed',
        body: [
          'Byte9 has been approved as a supplier on G-Cloud 14, the UK government framework for buying cloud software and services. Blaze is listed as a qualified headless CMS on the Digital Marketplace.',
        ],
      },
      {
        heading: 'What public sector teams get',
        body: [
          'Blaze gives councils and agencies cloud-based, no-code content management, user segmentation and personalisation, analytics, and integration with the SaaS tools councils already use.',
          'Because it is pre-approved, buyers can procure it quickly as part of a digital transformation programme, with the aim of lowering the cost to serve while improving how residents use services online.',
        ],
      },
      {
        heading: 'Already proven in local government',
        body: [
          'Three Rivers District Council runs its resident-facing website on Blaze, with staff updating content themselves and residents self-serving around the clock.',
        ],
      },
    ],
    legacyPaths: [
      '/our-work/byte9-awarded-g-cloud-14-government-software-supplier-status',
      '/byte9-achieve-government-g-cloud-supplier-status',
    ],
  },
  {
    slug: 'beyond-wordpress',
    kind: 'Insight',
    title: 'Why high-performance sites move beyond WordPress',
    summary:
      'WordPress powers a huge share of the web, but its monolithic, plugin-heavy design struggles at scale. Here is where a headless platform like Blaze pulls ahead.',
    tags: ['Blaze', 'Architecture'],
    sections: [
      {
        heading: 'Monolith versus headless',
        body: [
          'WordPress ties its front end and back end tightly together and leans on independently built plugins for most features. Each plugin adds risk to performance, security and compatibility.',
          'Blaze separates content from presentation and manages its plugins centrally, putting every change through Snyk, Dependabot, Jest, Playwright and BrowserStack before release.',
        ],
      },
      {
        heading: 'Layouts without code',
        body: [
          'WordPress models most pages as blog posts, which limits what editors can build. The Blaze Page Builder lets non-technical teams compose rich, multimedia layouts from components.',
        ],
      },
      {
        heading: 'Speed by design',
        body: [
          'Blaze runs on Node.js, React, GraphQL, MongoDB and Elasticsearch, with server-side rendering and delivery through AWS CloudFront. Performance comes from the architecture rather than caching plugins.',
        ],
      },
      {
        heading: 'Personal, not just cached',
        body: [
          'Static cached pages cannot respond to the individual reader. Blaze supports real-time personalisation and first-party data collection through Snowplow.',
        ],
      },
      {
        heading: 'Security and technical debt',
        body: [
          'Decentralised plugin development has left WordPress with tens of thousands of known vulnerabilities, and major editor changes have broken themes and plugins. Blaze ships through continuous deployment with automated security monitoring, and follows MACH and Jamstack principles.',
        ],
      },
    ],
    legacyPaths: ['/our-work/why-sophisticated-performant-websites-dont-use-wordpress'],
  },
  {
    slug: 'test-driven-development-in-blaze',
    kind: 'Insight',
    title: 'Test-driven development in Blaze',
    summary:
      'Automated testing cuts maintenance costs and makes releases predictable. Every Blaze change passes four layers of checks before it ships.',
    tags: ['Engineering', 'Testing'],
    sections: [
      {
        heading: 'Why test first',
        body: [
          'Writing tests alongside code reduces debugging time, lowers the cost of maintenance and makes each release more predictable.',
        ],
      },
      {
        heading: 'Four layers of checks',
        body: [
          'Linting enforces shared standards across TypeScript, JavaScript and React. Unit tests run on Jest, with more than 5,000 tests at 82% coverage and a target of 100%, tracked over time in Codecov.',
          'Functional tests use Puppeteer and Jest snapshots to verify how services respond. Visual regression tests use Playwright to compare page snapshots across browsers.',
        ],
      },
      {
        heading: 'Built into the pipeline',
        body: [
          'Code only moves forward when it passes each stage in turn: lint, unit, functional, then visual. Teams building with Blaze inherit the same discipline.',
        ],
      },
    ],
    legacyPaths: ['/unit-functional-and-qa-testing-in-blaze'],
  },
  {
    slug: 'continuous-integration-and-deployment',
    kind: 'Insight',
    title: 'How we ship: continuous integration and deployment',
    summary:
      'Instead of big periodic releases, Blaze ships small changes continuously, backed by automated tests and on-demand environments.',
    year: 2022,
    tags: ['Engineering', 'DevOps'],
    sections: [
      {
        heading: 'Testing as the default',
        body: [
          'We work test-first. Every change is linted, unit tested with Jest, functionally tested with Puppeteer and Jest snapshots, and checked for visual regressions with Playwright.',
        ],
      },
      {
        heading: 'Environments on demand',
        body: [
          'Terraform and GitHub Actions spin up complete environments on AWS, Google Cloud or Azure, so several features can be tested at once without queueing for a shared server.',
        ],
      },
      {
        heading: 'Automated releases',
        body: [
          'A monorepo managed with Lerna keeps dependencies in step. Conventional commits drive version numbers and changelogs, and packages publish to npm automatically.',
          'The result is fast, concurrent releases across the CMS, the API framework and the React front end, at lower cost and with distributed teams working in parallel.',
        ],
      },
    ],
    legacyPaths: ['/our-continuous-integration-and-deployment-process'],
  },
  {
    slug: 'terraform-infrastructure-as-code',
    kind: 'Insight',
    title: 'Infrastructure as code with Terraform',
    summary:
      'Terraform lets us stand up and tear down Blaze environments on any major cloud in minutes, with fewer manual steps and fewer mistakes.',
    year: 2022,
    tags: ['DevOps', 'Cloud'],
    sections: [
      {
        heading: 'Templates, not tickets',
        body: [
          'Storage, databases, logging, autoscaling, load balancing and CDN are all defined in templated code and provisioned through GitHub Actions, rather than set up by hand.',
        ],
      },
      {
        heading: 'Any cloud',
        body: ['The same approach works on AWS, Google Cloud and Microsoft Azure.'],
      },
      {
        heading: 'What it saves',
        body: [
          'Environments are quick to create and dispose of, standards and policies are applied centrally, resources are only paid for when needed, and there is less dependence on specialist DevOps time.',
        ],
      },
    ],
    legacyPaths: ['/using-terraform-to-reduce-dependencies'],
  },
  {
    slug: 'monitoring-blaze-with-datadog',
    kind: 'Insight',
    title: 'Monitoring Blaze end to end with Datadog',
    summary:
      'One dashboard for every layer of the stack, with forecasting that flags problems before readers notice them.',
    tags: ['DevOps', 'Monitoring'],
    sections: [
      {
        heading: 'Everything in one place',
        body: [
          'Datadog collects data from more than 70 AWS services and from infrastructure on Google Cloud and Azure, alongside real-time performance of the Blaze microservices that Terraform manages.',
        ],
      },
      {
        heading: 'Ahead of problems',
        body: [
          'Machine-learning forecasts and integrated security monitoring help teams act before performance degrades, reducing both risk and running costs.',
        ],
      },
      {
        heading: 'Standard with Blaze',
        body: ['Datadog is part of the standard Blaze setup and of the developer support Byte9 provides.'],
      },
    ],
    legacyPaths: ['/our-work/article-why-datadog'],
  },
  {
    slug: 'first-party-data-without-cookies',
    kind: 'Insight',
    title: 'Monetising first-party data without third-party cookies',
    summary:
      'As browsers phase out third-party cookies, publishers need their own data. Blaze captures compliant engagement data at component level.',
    year: 2024,
    tags: ['Data', 'Publishing'],
    sections: [
      {
        heading: 'The problem',
        body: [
          'Third-party cookies are being withdrawn by the major browsers, weakening the targeting that much digital advertising relies on. An IAB survey found 69% of advertisers concerned about the loss.',
        ],
      },
      {
        heading: 'The opportunity',
        body: [
          'eMarketer reported in 2023 that 88% of marketers were prioritising first-party data, and Statista projects the digital advertising market at $786.2 billion by 2026.',
        ],
      },
      {
        heading: 'How Blaze helps',
        body: [
          'Blaze tracks engagement and events at the level of individual page components, then shares that data with partners such as Snowplow, Mapp and Segment. Publishers can segment audiences and personalise content without third-party cookies. Kogan Page is one publisher putting this to work.',
        ],
      },
    ],
    legacyPaths: ['/our-work/monetising-publishers-first-party-data-in-a-cookieless-world'],
  },
  {
    slug: 'personalisation-with-mapp-engage',
    kind: 'Insight',
    title: 'Personalised marketing with Mapp Engage',
    summary:
      'Blaze shares engagement, transaction and conversion data with Mapp Engage, so marketers can target audiences across email, SMS, social and push.',
    year: 2023,
    tags: ['Data', 'Integrations'],
    sections: [
      {
        heading: 'Why it matters',
        body: [
          'With third-party cookies disappearing, brands need first-party data to keep marketing personal and effective.',
        ],
      },
      {
        heading: 'How the integration works',
        body: [
          'Mapp Engage is a cross-channel marketing automation platform. Blaze passes it page-level engagement, transactional and conversion data, which non-technical teams can turn into segments and targeted campaigns.',
          'That first-party data can be combined with second- and third-party sources for precise audience targeting. Kogan Page uses Mapp segmentation to target audiences quickly and at scale.',
        ],
      },
    ],
    legacyPaths: ['/our-work/personalise-your-marketing-with-mapp-engage'],
  },
  {
    slug: 'boat-international-google-ad-manager',
    kind: 'Insight',
    title: 'Smarter ad segmentation for Boat International',
    summary:
      'Blaze and Google Ad Manager let Boat International target ads by content and product attributes, growing ad revenue year on year.',
    year: 2022,
    tags: ['Publishing', 'Advertising'],
    sections: [
      {
        heading: 'The goal',
        body: [
          'Boat International serves high-net-worth readers in the superyacht and luxury sectors, and wanted to segment content more precisely to grow advertising revenue.',
        ],
      },
      {
        heading: 'What we built',
        body: [
          'Commercial staff use the no-code Page Builder to create targeted ad slots in search, listings, articles and navigation. Blaze matches content and product attributes to each slot, for both broad and precise targeting.',
          'Performance is analysed through Google Analytics, BigQuery and Looker Studio.',
        ],
      },
      {
        heading: 'The result',
        body: [
          'Ad revenue grows year on year, placements and formats keep improving, and better search optimisation has brought more traffic.',
        ],
      },
    ],
    legacyPaths: [],
  },
];
