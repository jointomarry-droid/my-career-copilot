import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import { ErrorBoundaryWrapper } from '../components/ErrorBoundary';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aicareercopilot.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AI Career Copilot — AI-Powered Career Automation Platform',
    template: '%s | AI Career Copilot',
  },
  description: 'Autonomous AI platform that discovers scholarships, jobs, and work permits worldwide, then applies to them automatically using Playwright browser automation and LLM-powered form filling.',
  keywords: [
    'AI career copilot', 'automated job applications', 'scholarship finder',
    'work permit automation', 'AI job apply', 'resume optimizer',
    'ATS optimization', 'LinkedIn optimizer', 'career automation',
    'Playwright automation', 'LLM form filling', 'job discovery AI',
  ],
  authors: [{ name: 'AI Career Copilot' }],
  creator: 'AI Career Copilot',
  publisher: 'AI Career Copilot',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'AI Career Copilot',
    title: 'AI Career Copilot — AI-Powered Career Automation Platform',
    description: 'Autonomous AI platform that discovers scholarships, jobs, and work permits worldwide, then applies to them automatically.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Career Copilot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Career Copilot — AI-Powered Career Automation',
    description: 'Autonomous AI platform that discovers and applies to scholarships, jobs, and work permits worldwide.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {},
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Career Copilot',
    description: 'Autonomous AI platform that discovers scholarships, jobs, and work permits worldwide, then applies to them automatically.',
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '1250', bestRating: '5' },
    featureList: [
      'AI-powered scholarship discovery and auto-apply',
      'Automated job application with Playwright',
      'LLM-powered resume tailoring',
      'Work permit visa scoring for 6 countries',
      'Interview preparation with company research',
      'SEO optimization for profile discoverability',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Career Copilot',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AI Career Copilot?',
        acceptedAnswer: { '@type': 'Answer', text: 'An autonomous AI platform that discovers scholarships, jobs, and work permits worldwide, then applies to them automatically using browser automation.' },
      },
      {
        '@type': 'Question',
        name: 'How does auto-apply work?',
        acceptedAnswer: { '@type': 'Answer', text: 'It uses Playwright to navigate portals, scans forms, uses AI to generate content, and fills forms with human-mimic typing.' },
      },
    ],
  },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0A0A0B" />
        <link rel="sitemap" type="application/xml" href="/api/seo/sitemap" />
        {jsonLd.map((schema, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        ))}
      </head>
      <body className="antialiased">
        <ErrorBoundaryWrapper>
          <Providers>
            <Toaster position="top-right" richColors closeButton theme="dark" />
            {children}
          </Providers>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
