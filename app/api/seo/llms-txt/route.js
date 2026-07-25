import { NextResponse } from 'next/server';

export async function GET() {
  const llmsTxt = `# AI Career Copilot

> Autonomous AI-powered career platform that discovers and applies to scholarships, jobs, and work permits worldwide.

## What It Does

AI Career Copilot automates the entire job application process using browser automation and AI. It discovers opportunities globally, tailors your resume for each one, fills application forms, and submits them — all autonomously.

## Core Capabilities

- Discovers scholarships from DAAD, Chevening, Fulbright, Erasmus Mundus
- Finds jobs on LinkedIn, Indeed, Glassdoor, company career pages
- Identifies work permit pathways for Germany, Netherlands, UK, Switzerland, Canada, Australia
- Uses Playwright browser automation with anti-detection
- Fills forms using Claude/GPT with human-mimic typing
- Tailors resumes and cover letters per application
- Tracks application status via portal scraping
- Sends notifications via email, Slack, Telegram, Discord

## Technology Stack

- Next.js 14 (App Router)
- React 18 + Tailwind CSS
- MongoDB (with in-memory fallback)
- Playwright for browser automation
- Anthropic Claude API for AI content generation
- Node-cron for scheduling

## Pricing

Free tier available. Premium plans for unlimited auto-apply and advanced AI features.

## Contact

- Website: https://aicareercopilot.com
- Email: support@aicareercopilot.com
`;

  return new NextResponse(llmsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
