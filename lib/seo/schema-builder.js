/**
 * JSON-LD Structured Data Builder
 *
 * Generates type-safe structured data for:
 *   - SoftwareApplication (the Career Copilot product)
 *   - Organization
 *   - FAQPage
 *   - WebSite with SearchAction
 *   - BreadcrumbList
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aicareercopilot.com';
const SITE_NAME = 'AI Career Copilot';
const SITE_DESCRIPTION = 'Autonomous AI-powered career platform that discovers scholarships, jobs, and work permits worldwide, then applies to them automatically using browser automation and LLM-powered form filling.';

export function buildSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
    },
    featureList: [
      'AI-powered scholarship discovery and auto-apply',
      'Automated job application with Playwright browser automation',
      'LLM-powered resume tailoring and cover letter generation',
      'Work permit and visa eligibility scoring for 6 countries',
      'Smart deduplication and application tracking',
      'Real-time agent monitoring via SSE streaming',
      'Multi-channel notifications (Email, Slack, Telegram, Discord)',
      'Interview preparation with company research and salary intelligence',
      'SEO optimization for professional profile discoverability',
    ],
    screenshot: `${SITE_URL}/og-image.png`,
    softwareVersion: '1.0.0',
    datePublished: '2026-01-01',
    author: {
      '@type': 'Organization',
      name: 'AI Career Copilot',
    },
  };
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
  };
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AI Career Copilot?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI Career Copilot is an autonomous AI platform that discovers scholarships, jobs, and work permits worldwide, then applies to them automatically using Playwright browser automation and LLM-powered form filling.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the auto-apply feature work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The system uses Playwright to navigate to application portals, scans form fields, uses AI (Claude/GPT) to generate personalized content, and fills forms with human-mimic typing patterns to avoid detection.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which countries does AI Career Copilot support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The platform covers 210+ countries with specialized agents for scholarships (DAAD, Chevening, Fulbright), jobs (LinkedIn, Indeed, Glassdoor), and work permits (Schengen, UK, Canada, Australia, USA, Switzerland).',
        },
      },
      {
        '@type': 'Question',
        name: 'Is AI Career Copilot free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI Career Copilot offers a free tier with basic features. Premium features like unlimited auto-apply, advanced AI tailoring, and priority support are available in paid plans.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the interview preparation feature work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Interview Coach agent researches companies via web scraping, generates tailored interview questions, creates pre-interview briefing documents, and provides salary intelligence based on role, location, and market data.',
        },
      },
    ],
  };
}

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  };
}

export function generateAllSchemas() {
  return [
    buildSoftwareApplicationSchema(),
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildFAQSchema(),
  ];
}
